import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
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

  @Get('crew/assignable-flights')
  assignableFlights(@Req() req: HaveRequest) {
    return this.workspace.assignableFlights(req);
  }

  @Put('crew/assignments/:assignmentId')
  updateCrewAssignment(
    @Req() req: HaveRequest,
    @Param('assignmentId') assignmentId: string,
    @Body()
    body: {
      activity?: string;
      startsAt?: string;
      endsAt?: string;
      notes?: string;
      flightCode?: string;
      origin?: string;
      destination?: string;
      aircraftRegistration?: string;
    },
  ) {
    return this.workspace.updateCrewAssignment(req, assignmentId, body);
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

  @Post('crew/documents/:documentId/review')
  reviewCrewDocument(
    @Req() req: HaveRequest,
    @Param('documentId') documentId: string,
    @Body() body: { decision?: string; note?: string },
  ) {
    return this.workspace.reviewCrewDocument(req, documentId, body);
  }

  @Post('crew/assignments/:assignmentId/publish')
  publishAssignment(@Req() req: HaveRequest, @Param('assignmentId') assignmentId: string) {
    return this.workspace.publishAssignment(req, assignmentId);
  }

  @Post('crew/assignments/:assignmentId/change-requests')
  requestAssignmentChange(
    @Req() req: HaveRequest,
    @Param('assignmentId') assignmentId: string,
    @Body() body: { reason?: string; activity?: string; startsAt?: string; endsAt?: string },
  ) {
    return this.workspace.requestAssignmentChange(req, assignmentId, body);
  }

  @Post('crew/change-requests/:requestId/review')
  reviewChangeRequest(
    @Req() req: HaveRequest,
    @Param('requestId') requestId: string,
    @Body() body: { decision?: string; note?: string },
  ) {
    return this.workspace.reviewChangeRequest(req, requestId, body);
  }

  @Post('crew/:id/previous-experience')
  addPreviousExperience(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body() body: { origin?: string; flightMinutes?: number; asOf?: string; functionCode?: string; registration?: string; note?: string },
  ) {
    return this.workspace.addPreviousExperience(req, id, body);
  }

  @Get('crew/:id/export/:kind')
  async exportCrew(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Param('kind') kind: string,
    @Res() reply: FastifyReply,
  ) {
    const bytes = await this.workspace.crewPdf(req, id, kind);
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="crew-${kind}.pdf"`);
    return reply.send(bytes);
  }

  @Post('crew/:id/documents')
  createCrewDocument(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body()
    body: {
      category?: string;
      title?: string;
      documentNumber?: string;
      issuer?: string;
      expiresOn?: string;
      status?: string;
    },
  ) {
    return this.workspace.createCrewDocument(req, id, body);
  }

  @Put('crew/documents/:documentId')
  updateCrewDocument(
    @Req() req: HaveRequest,
    @Param('documentId') documentId: string,
    @Body()
    body: {
      category?: string;
      title?: string;
      documentNumber?: string;
      issuer?: string;
      expiresOn?: string;
      status?: string;
    },
  ) {
    return this.workspace.updateCrewDocument(req, documentId, body);
  }

  @Delete('crew/documents/:documentId')
  softDeleteCrewDocument(@Req() req: HaveRequest, @Param('documentId') documentId: string) {
    return this.workspace.softDeleteCrewDocument(req, documentId);
  }

  @Post('crew/:id/assignments')
  createCrewAssignment(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body()
    body: {
      activity?: string;
      startsAt?: string;
      endsAt?: string;
      notes?: string;
      flightCode?: string;
      origin?: string;
      destination?: string;
      aircraftRegistration?: string;
    },
  ) {
    return this.workspace.createCrewAssignment(req, id, body);
  }

  @Get('aircraft')
  aircraft(@Req() req: HaveRequest) {
    return this.workspace.aircraft(req);
  }

  @Post('aircraft')
  createAircraft(
    @Req() req: HaveRequest,
    @Body()
    body: {
      registration?: string;
      model?: string;
      serialNumber?: string;
      base?: string;
      technicalStatus?: string;
      airframeHours?: number | null;
      airframeCycles?: number | null;
    },
  ) {
    return this.workspace.createAircraft(req, body);
  }

  @Put('aircraft/:id')
  updateAircraft(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body()
    body: {
      registration?: string;
      model?: string;
      serialNumber?: string;
      base?: string;
      technicalStatus?: string;
      airframeHours?: number | null;
      airframeCycles?: number | null;
    },
  ) {
    return this.workspace.updateAircraft(req, id, body);
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

  @Put('flights/:id')
  updateFlight(
    @Req() req: HaveRequest,
    @Param('id') id: string,
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
    return this.workspace.updateFlight(req, id, body);
  }

  @Put('flights/:id/log')
  upsertFlightLog(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body()
    body: {
      blockMinutes?: number;
      flightMinutes?: number;
      cycles?: number;
      pilotName?: string;
      reviewStatus?: string;
      notes?: string;
    },
  ) {
    return this.workspace.upsertFlightLog(req, id, body);
  }

  @Post('flights/:id/legs')
  createFlightLeg(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body() body: { origin?: string; destination?: string; sequence?: number; eet?: string },
  ) {
    return this.workspace.createFlightLeg(req, id, body);
  }

  @Put('flights/legs/:legId')
  updateFlightLeg(
    @Req() req: HaveRequest,
    @Param('legId') legId: string,
    @Body() body: { origin?: string; destination?: string; sequence?: number; eet?: string },
  ) {
    return this.workspace.updateFlightLeg(req, legId, body);
  }

  @Delete('flights/legs/:legId')
  softDeleteFlightLeg(@Req() req: HaveRequest, @Param('legId') legId: string) {
    return this.workspace.softDeleteFlightLeg(req, legId);
  }

  @Get('operations/services')
  services(@Req() req: HaveRequest) {
    return this.workspace.services(req);
  }

  @Post('operations/services')
  createService(
    @Req() req: HaveRequest,
    @Body()
    body: {
      flightId?: string | null;
      kind?: string;
      provider?: string;
      status?: string;
      amount?: number;
      currency?: string;
      airport?: string | null;
      officialUrl?: string | null;
    },
  ) {
    return this.workspace.createService(req, body);
  }

  @Get('operations/expenses')
  expenses(@Req() req: HaveRequest) {
    return this.workspace.expenses(req);
  }

  @Post('operations/expenses')
  createExpense(
    @Req() req: HaveRequest,
    @Body()
    body: {
      flightId?: string | null;
      category?: string;
      description?: string;
      amount?: number;
      currency?: string;
      status?: string;
    },
  ) {
    return this.workspace.createExpense(req, body);
  }

  @Put('operations/expenses/:id/status')
  updateExpenseStatus(@Req() req: HaveRequest, @Param('id') id: string, @Body() body: { status?: string }) {
    return this.workspace.updateExpenseStatus(req, id, body.status ?? '');
  }

  @Get('operations/payments')
  payments(@Req() req: HaveRequest) {
    return this.workspace.payments(req);
  }

  @Post('operations/payments')
  createPayment(
    @Req() req: HaveRequest,
    @Body()
    body: {
      serviceId?: string | null;
      expenseId?: string | null;
      amount?: number;
      currency?: string;
      method?: string;
      status?: string;
      officialUrl?: string | null;
      reference?: string;
    },
  ) {
    return this.workspace.createPayment(req, body);
  }

  @Get('maintenance/inspections')
  inspections(@Req() req: HaveRequest) {
    return this.workspace.inspections(req);
  }

  @Post('maintenance/inspections')
  createInspection(
    @Req() req: HaveRequest,
    @Body() body: { aircraftId?: string; title?: string; dueDate?: string | null; dueHours?: number | null; status?: string },
  ) {
    return this.workspace.createInspection(req, body);
  }

  @Get('maintenance/discrepancies')
  discrepancies(@Req() req: HaveRequest) {
    return this.workspace.discrepancies(req);
  }

  @Post('maintenance/discrepancies')
  createDiscrepancy(
    @Req() req: HaveRequest,
    @Body()
    body: {
      aircraftId?: string;
      flightId?: string | null;
      title?: string;
      description?: string;
      correctiveAction?: string;
      status?: string;
    },
  ) {
    return this.workspace.createDiscrepancy(req, body);
  }

  @Get('maintenance/work-orders')
  workOrders(@Req() req: HaveRequest) {
    return this.workspace.workOrders(req);
  }

  @Post('maintenance/work-orders')
  createWorkOrder(
    @Req() req: HaveRequest,
    @Body()
    body: {
      aircraftId?: string;
      discrepancyId?: string | null;
      title?: string;
      assignedTo?: string;
      status?: string;
      evidence?: string;
    },
  ) {
    return this.workspace.createWorkOrder(req, body);
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

  @Put('sms/reports/:id/status')
  updateSmsStatus(@Req() req: HaveRequest, @Param('id') id: string, @Body() body: { status?: string }) {
    return this.workspace.updateSmsStatus(req, id, body.status ?? '');
  }

  @Get('communication/meetings')
  meetings(@Req() req: HaveRequest) {
    return this.workspace.meetings(req);
  }

  @Post('communication/meetings')
  createMeeting(
    @Req() req: HaveRequest,
    @Body() body: { title?: string; startsAt?: string; agenda?: string; status?: string; locationUrl?: string | null },
  ) {
    return this.workspace.createMeeting(req, body);
  }

  @Put('communication/meetings/:id/minutes')
  updateMeetingMinutes(
    @Req() req: HaveRequest,
    @Param('id') id: string,
    @Body() body: { minutes?: string; minutesStatus?: string },
  ) {
    return this.workspace.updateMeetingMinutes(req, id, body);
  }

  @Get('library/documents')
  documents(@Req() req: HaveRequest) {
    return this.workspace.documents(req);
  }

  @Post('library/documents')
  createDocument(
    @Req() req: HaveRequest,
    @Body()
    body: {
      code?: string;
      title?: string;
      category?: string;
      edition?: string;
      amendment?: string;
      language?: string;
      reference?: string;
      status?: string;
    },
  ) {
    return this.workspace.createDocument(req, body);
  }

  @Get('library/bookmarks')
  bookmarks(@Req() req: HaveRequest) {
    return this.workspace.bookmarks(req);
  }

  @Post('library/bookmarks')
  createBookmark(
    @Req() req: HaveRequest,
    @Body() body: { documentId?: string; page?: number; note?: string },
  ) {
    return this.workspace.createBookmark(req, body);
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
