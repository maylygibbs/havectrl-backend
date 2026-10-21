import { afterAll, describe, expect, it } from 'vitest';
import { loadEnv } from '../db/load-env';
import { ConfigRegistry } from './config-registry';

const run = process.env.INTEGRATION_TEST === '1';

describe.skipIf(!run)('ACC-01 tenant database isolation (integration)', () => {
  const registry = new ConfigRegistry();

  afterAll(async () => {
    await registry.init().catch(() => undefined);
  });

  it('uses separate databases per tenant slug', async () => {
    loadEnv();
    await registry.init();
    const demoa = registry.getTenant('demoa');
    const demob = registry.getTenant('demob');
    expect(demoa.database).toBeTruthy();
    expect(demob.database).toBeTruthy();
    expect(demoa.database).not.toBe(demob.database);
  });

  it('does not leak a row inserted in demoa into demob', async () => {
    loadEnv();
    await registry.init();
    const marker = `ISO-${Date.now()}`;
    let workerId: string | null = null;
    await registry.withTenant('demoa', async (db) => {
      const { rows } = await db.query(
        `INSERT INTO crew.workers (employee_code, full_name, position, base, status)
         VALUES ($1, $2, 'Test', 'SVMI', 'active')
         RETURNING id`,
        [marker, `Isolation ${marker}`],
      );
      workerId = rows[0]?.id as string;
    });
    expect(workerId).toBeTruthy();
    const other = await registry.withTenant('demob', async (db) => {
      const { rows } = await db.query(`SELECT id FROM crew.workers WHERE employee_code = $1`, [marker]);
      return rows.length;
    });
    expect(other).toBe(0);
    await registry.withTenant('demoa', async (db) => {
      await db.query(`UPDATE crew.workers SET deleted_at = now() WHERE id = $1`, [workerId]);
    });
  });
});
