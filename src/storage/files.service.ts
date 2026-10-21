import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, unlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { assertModule } from '../access';
import { ConfigRegistry } from '../tenancy/config-registry';
import { HaveRequest } from '../tenancy/tenant.middleware';
import {
  absoluteStoragePath,
  ensureDirForFile,
  storageKeyBelongsToTenant,
  storageRoot,
  tenantObjectPath,
} from './storage-paths';

const ALLOWED_MODULES = new Set(['aircraft', 'library', 'crew']);

@Injectable()
export class FilesService {
  constructor(private readonly registry: ConfigRegistry) {}

  private moduleForStorage(module: string) {
    const key = module?.trim();
    if (!key || !ALLOWED_MODULES.has(key)) {
      throw new BadRequestException('module must be aircraft, library, or crew');
    }
    return key;
  }

  list(req: HaveRequest, module: string, entityId?: string) {
    const mod = this.moduleForStorage(module);
    assertModule(req, mod);
    const slug = req.tenantSlug;
    if (!slug) throw new BadRequestException('Domain not registered');
    return this.registry.withTenant(slug, async (db) => {
      const params: unknown[] = [mod];
      let sql = `SELECT id, module, entity_id, original_name, mime_type, byte_size, created_at::text AS created_at
                 FROM storage.files WHERE deleted_at IS NULL AND module = $1`;
      if (entityId) {
        params.push(entityId);
        sql += ` AND entity_id = $2`;
      }
      sql += ' ORDER BY created_at DESC';
      const { rows } = await db.query(sql, params);
      return rows;
    });
  }

  async uploadMultipart(req: HaveRequest) {
    const slug = req.tenantSlug;
    if (!slug) throw new BadRequestException('Domain not registered');
    let buffer: Buffer | null = null;
    let originalName = 'upload.bin';
    let mimeType = 'application/octet-stream';
    let moduleRaw = '';
    let entityRaw = '';
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        buffer = await part.toBuffer();
        originalName = part.filename || originalName;
        mimeType = part.mimetype || mimeType;
      } else if (part.fieldname === 'module') {
        moduleRaw = String(await part.value);
      } else if (part.fieldname === 'entityId') {
        entityRaw = String(await part.value);
      }
    }
    if (!buffer) throw new BadRequestException('file is required');
    const mod = this.moduleForStorage(moduleRaw);
    assertModule(req, mod);
    const entityId = entityRaw.trim() || null;
    if (buffer.length === 0) throw new BadRequestException('empty file');
    const maxBytes = Number(process.env.STORAGE_MAX_BYTES ?? 15 * 1024 * 1024);
    if (buffer.length > maxBytes) throw new BadRequestException('file too large');

    const fileId = randomUUID();
    const storageKey = tenantObjectPath(slug, fileId, originalName);
    const absolute = absoluteStoragePath(storageKey);
    ensureDirForFile(absolute);
    writeFileSync(absolute, buffer);

    return this.registry.withTenant(slug, async (db) => {
      try {
        const { rows } = await db.query(
          `INSERT INTO storage.files
             (id, module, entity_id, original_name, mime_type, byte_size, storage_key, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, module, entity_id, original_name, mime_type, byte_size, created_at::text AS created_at`,
          [
            fileId,
            mod,
            entityId,
            originalName,
            mimeType,
            buffer.length,
            storageKey,
            req.user?.sub ?? null,
          ],
        );
        return rows[0];
      } catch (err) {
        try {
          unlinkSync(absolute);
        } catch {
          /* ignore */
        }
        throw err;
      }
    });
  }

  async download(req: HaveRequest, id: string): Promise<{ stream: StreamableFile; name: string; mime: string }> {
    const slug = req.tenantSlug;
    if (!slug) throw new BadRequestException('Domain not registered');
    const row = await this.registry.withTenant(slug, async (db) => {
      const { rows } = await db.query(
        `SELECT module, original_name, mime_type, storage_key
         FROM storage.files WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );
      return rows[0] as
        | { module: string; original_name: string; mime_type: string; storage_key: string }
        | undefined;
    });
    if (!row) throw new NotFoundException('File not found');
    assertModule(req, row.module);
    if (!storageKeyBelongsToTenant(slug, row.storage_key)) {
      throw new NotFoundException('File not found');
    }
    const absolute = absoluteStoragePath(row.storage_key);
    const stream = createReadStream(absolute);
    return {
      stream: new StreamableFile(stream, { type: row.mime_type, disposition: `attachment; filename="${row.original_name}"` }),
      name: row.original_name,
      mime: row.mime_type,
    };
  }

  softDelete(req: HaveRequest, id: string) {
    const slug = req.tenantSlug;
    if (!slug) throw new BadRequestException('Domain not registered');
    return this.registry.withTenant(slug, async (db) => {
      const found = await db.query(
        `SELECT module FROM storage.files
         WHERE id = $1 AND deleted_at IS NULL
           AND replace(storage_key, E'\\\\', '/') LIKE $2`,
        [id, `${slug}/%`],
      );
      const mod = found.rows[0]?.module as string | undefined;
      if (!mod) throw new NotFoundException('File not found');
      assertModule(req, mod);
      const { rows } = await db.query(
        `UPDATE storage.files SET deleted_at = now() WHERE id = $1 RETURNING id`,
        [id],
      );
      return { ok: true, id: rows[0]?.id };
    });
  }

  storageSummary() {
    return { root: storageRoot(), maxBytes: Number(process.env.STORAGE_MAX_BYTES ?? 15 * 1024 * 1024) };
  }
}
