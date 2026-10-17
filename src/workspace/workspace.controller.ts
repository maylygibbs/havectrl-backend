import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { HaveRequest } from '../tenancy/tenant.middleware';
import { WorkspaceService } from './workspace.service';

@Controller()
@UseGuards(AuthGuard)
export class WorkspaceController {
  constructor(private readonly workspace: WorkspaceService) {}

  @Get('home')
  home(@Req() req: HaveRequest) {
    return this.workspace.home(req);
  }

  @Get('crew')
  crew(@Req() req: HaveRequest) {
    return this.workspace.crew(req);
  }

  @Get('crew/:id')
  crewDetail(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.workspace.crewDetail(req, id);
  }

  @Get('aircraft')
  aircraft(@Req() req: HaveRequest) {
    return this.workspace.aircraft(req);
  }

  @Get('aircraft/:id')
  aircraftDetail(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.workspace.aircraftDetail(req, id);
  }

  @Get('flights')
  flights(@Req() req: HaveRequest) {
    return this.workspace.flights(req);
  }

  @Get('flights/:id')
  flightDetail(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.workspace.flightDetail(req, id);
  }

  @Get('operations/services')
  services(@Req() req: HaveRequest) {
    return this.workspace.services(req);
  }

  @Get('operations/expenses')
  expenses(@Req() req: HaveRequest) {
    return this.workspace.expenses(req);
  }

  @Get('maintenance/inspections')
  inspections(@Req() req: HaveRequest) {
    return this.workspace.inspections(req);
  }

  @Get('maintenance/discrepancies')
  discrepancies(@Req() req: HaveRequest) {
    return this.workspace.discrepancies(req);
  }

  @Get('maintenance/work-orders')
  workOrders(@Req() req: HaveRequest) {
    return this.workspace.workOrders(req);
  }

  @Get('maintenance/log-review')
  logReview(@Req() req: HaveRequest) {
    return this.workspace.logReview(req);
  }

  @Get('sms/reports')
  smsReports(@Req() req: HaveRequest) {
    return this.workspace.smsReports(req);
  }

  @Post('sms/reports')
  createSmsReport(
    @Req() req: HaveRequest,
    @Body() body: { title?: string; narrative?: string; anonymous?: boolean; severity?: string },
  ) {
    return this.workspace.createSmsReport(req, body);
  }

  @Get('communication/meetings')
  meetings(@Req() req: HaveRequest) {
    return this.workspace.meetings(req);
  }

  @Get('library/documents')
  documents(@Req() req: HaveRequest) {
    return this.workspace.documents(req);
  }

  @Get('settings/users')
  users(@Req() req: HaveRequest) {
    return this.workspace.users(req);
  }
}
