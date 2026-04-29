import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  AgendaClientService,
  CreateCitaPayload,
  CreateRecordatorioPayload,
} from '../external-client/agenda-client.service';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agenda: AgendaClientService) {}

  @Get('paciente/:pacienteId/citas')
  getCitas(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.agenda.getCitasByPaciente(pacienteId);
  }

  @Get('paciente/:pacienteId/recordatorios')
  getRecordatorios(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.agenda.getRecordatoriosByPaciente(pacienteId);
  }

  @Post('citas')
  createCita(@Body() dto: CreateCitaPayload) {
    return this.agenda.createCita(dto);
  }

  @Post('recordatorios')
  createRecordatorio(@Body() dto: CreateRecordatorioPayload) {
    return this.agenda.createRecordatorio(dto);
  }
}