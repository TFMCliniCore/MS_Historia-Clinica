import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

export interface CitaRemota {
  id: number;
  fecha: string;
  motivo: string;
  tipo: string;
  estado: string;
  pacienteId: number;
  usuarioId?: number;
}

export interface RecordatorioRemoto {
  id: number;
  motivo: string;
  tipo: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  pacienteId: number;
}

export interface CreateCitaPayload {
  fecha: string;
  motivo: string;
  tipo: string;
  pacienteId: number;
  usuarioId?: number;
}

export interface CreateRecordatorioPayload {
  motivo: string;
  tipo: string;
  fechaDesde: string;
  fechaHasta: string;
  pacienteId: number;
  usuarioId?: number;
  citaId?: number;
}

@Injectable()
export class AgendaClientService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MS_AGENDA_URL ?? 'http://localhost:3003/api/v1';
  }

  async getCitasByPaciente(pacienteId: number): Promise<CitaRemota[]> {
    const res = await fetch(
      `${this.baseUrl}/citas?pacienteId=${pacienteId}`,
    );
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-agenda al obtener citas: ${res.status}`,
      );
    return res.json() as Promise<CitaRemota[]>;
  }

  async getRecordatoriosByPaciente(
    pacienteId: number,
  ): Promise<RecordatorioRemoto[]> {
    const res = await fetch(
      `${this.baseUrl}/recordatorios?pacienteId=${pacienteId}`,
    );
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-agenda al obtener recordatorios: ${res.status}`,
      );
    return res.json() as Promise<RecordatorioRemoto[]>;
  }

  async createCita(payload: CreateCitaPayload): Promise<CitaRemota> {
    const res = await fetch(`${this.baseUrl}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-agenda al crear cita: ${res.status}`,
      );
    return res.json() as Promise<CitaRemota>;
  }

  async createRecordatorio(
    payload: CreateRecordatorioPayload,
  ): Promise<RecordatorioRemoto> {
    const res = await fetch(`${this.baseUrl}/recordatorios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-agenda al crear recordatorio: ${res.status}`,
      );
    return res.json() as Promise<RecordatorioRemoto>;
  }
}