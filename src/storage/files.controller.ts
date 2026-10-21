import { Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { HaveRequest } from '../tenancy/tenant.middleware';
import { FilesService } from './files.service';

@Controller()
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get('files')
  list(@Req() req: HaveRequest, @Query('module') module: string, @Query('entityId') entityId?: string) {
    return this.files.list(req, module, entityId);
  }

  @Get('files/storage-info')
  storageInfo() {
    return this.files.storageSummary();
  }

  @Post('files')
  upload(@Req() req: HaveRequest) {
    return this.files.uploadMultipart(req);
  }

  @Get('files/:id/download')
  async download(@Req() req: HaveRequest, @Param('id') id: string) {
    const { stream } = await this.files.download(req, id);
    return stream;
  }

  @Delete('files/:id')
  softDelete(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.files.softDelete(req, id);
  }
}
