import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { HaveRequest } from '../tenancy/tenant.middleware';
import { CrewInput, WorkspaceService } from './workspace.service';

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

  @Get('crew/assignments')
  crewAssignments(@Req() req: HaveRequest) {
    return this.workspace.crewAssignments(req);
  }

  @Delete('crew/assignments/:assignmentId')
  softDeleteCrewAssignment(@Req() req: HaveRequest, @Param('assignmentId') assignmentId: string) {
    return this.workspace.softDeleteCrewAssignment(req, assignmentId);
  }

  @Get('crew/:id')
  crewDetail(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.workspace.crewDetail(req, id);
  }

  @Post('crew')
  createCrew(@Req() req: HaveRequest, @Body() body: CrewInput) {
    return this.workspace.createCrew(req, body);
  }

  @Put('crew/:id')
  updateCrew(@Req() req: HaveRequest, @Param('id') id: string, @Body() body: CrewInput) {
    return this.workspace.updateCrew(req, id, body);
  }

  @Delete('crew/:id')
  softDeleteCrew(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.workspace.softDeleteCrew(req, id);
  }

  @Post('crew/:id/assignments')
  createCrewAssignment(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body() body: { activity?: string; startsAt?: string; endsAt?: string; notes?: string },
  ) {
    return this.workspace.createCrewAssignment(req, id, body);
  }

  @Get('aircraft')
  aircraft(@Req() req: HaveRequest) {
    return this.workspace.aircraft(req);
  }

  @Get('aircraft/:id')
  aircraftDetail(@Req() req: HaveRequest, @Param('id') id: string) {
    return this.workspace.aircraftDetail(req, id);
  }

  @Post('aircraft/:id/documents')
  createAircraftDocument(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body() body: { title?: string; status?: string; expiresOn?: string | null },
  ) {
    return this.workspace.createAircraftDocument(req, id, body);
  }

  @Put('aircraft/documents/:documentId')
  updateAircraftDocument(
    @Req() req: HaveRequest,
    @Param('documentId') documentId: string,
    @Body() body: { title?: string; status?: string; expiresOn?: string | null },
  ) {
    return this.workspace.updateAircraftDocument(req, documentId, body);
  }

  @Delete('aircraft/documents/:documentId')
  softDeleteAircraftDocument(@Req() req: HaveRequest, @Param('documentId') documentId: string) {
    return this.workspace.softDeleteAircraftDocument(req, documentId);
  }

  @Get('flights')
  flights(@Req() req: HaveRequest) {
    return this.workspace.flights(req);
  }

  @Post('flights')
  createFlight(
    @Req() req: HaveRequest,
    @Body()
    body: {
      code?: string;
      aircraftId?: string;
      flightDate?: string;
      origin?: string;
      destination?: string;
      status?: string;
      eobt?: string;
    },
  ) {
    return this.workspace.createFlight(req, body);
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

  @Get('settings/company')
  companySettings(@Req() req: HaveRequest) {
    return this.workspace.companySettings(req);
  }

  @Patch('settings/company')
  updateCompanySettings(
    @Req() req: HaveRequest,
    @Body()
    body: {
      displayName?: string;
      tagline?: string;
      primaryColor?: string;
      accentColor?: string;
    },
  ) {
    return this.workspace.updateCompanySettings(req, body);
  }

  @Get('settings/profiles')
  profiles(@Req() req: HaveRequest) {
    return this.workspace.profiles(req);
  }

  @Get('settings/users')
  users(@Req() req: HaveRequest) {
    return this.workspace.users(req);
  }

  @Patch('settings/users/:email/profile')
  updateUserProfile(
    @Req() req: HaveRequest,
    @Param('email') email: string,
    @Body() body: { profile?: string },
  ) {
    return this.workspace.updateUserProfile(req, decodeURIComponent(email), body.profile ?? '');
  }

  @Patch('settings/language')
  setLanguage(@Req() req: HaveRequest, @Body() body: { language?: string }) {
    return this.workspace.setPreferredLanguage(req, body.language ?? '');
  }
}
