import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import {
  AgendaClientService,
  CreateCitaPayload,
  CreateRecordatorioPayload,
} from '../external-client/agenda-client.service';

@ApiTags('Interoperabilidad - Consultas de Agenda')
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agenda: AgendaClientService) {}

  @Get('paciente/:pacienteId/citas')
  @ApiOperation({ summary: 'Consultar el historial de citas del paciente consumiendo el MS de Agenda' })
  getCitas(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.agenda.getCitasByPaciente(pacienteId);
  }

  @Get('paciente/:pacienteId/recordatorios')
  @ApiOperation({ summary: 'Obtener las alertas y recordatorios programados para el paciente' })
  getRecordatorios(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.agenda.getRecordatoriosByPaciente(pacienteId);
  }

  @Post('citas')
  @ApiOperation({ summary: 'Solicitar de forma directa la apertura de una cita médica en la agenda' })
  createCita(@Body() dto: CreateCitaPayload) {
    return this.agenda.createCita(dto);
  }

  @Post('recordatorios')
  @ApiOperation({ summary: 'Programar una notificación de recordatorio externa' })
  createRecordatorio(@Body() dto: CreateRecordatorioPayload) {
    return this.agenda.createRecordatorio(dto);
  }
}