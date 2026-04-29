import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export interface ClienteRemoto {
  id: number;
  nombres: string;
  celular: string;
  email: string;
}

export interface PacienteRemoto {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  peso: string;
  foto?: string;
  cliente: ClienteRemoto;
}

export interface SucursalRemota {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

@Injectable()
export class EntidadesClientService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.MS_ENTIDADES_URL ?? 'http://localhost:3001/api/v1';
  }

  async getPaciente(id: number): Promise<PacienteRemoto> {
    const res = await fetch(`${this.baseUrl}/pacientes/${id}`);
    if (res.status === 404)
      throw new NotFoundException(`Paciente ${id} no encontrado.`);
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-entidades al obtener paciente: ${res.status}`,
      );
    return res.json() as Promise<PacienteRemoto>;
  }

  async getSucursal(id: number): Promise<SucursalRemota> {
    const res = await fetch(`${this.baseUrl}/sucursales/${id}`);
    if (res.status === 404)
      throw new NotFoundException(`Sucursal ${id} no encontrada.`);
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-entidades al obtener sucursal: ${res.status}`,
      );
    return res.json() as Promise<SucursalRemota>;
  }

  async getPacientesByIds(
    ids: number[],
  ): Promise<Map<number, PacienteRemoto>> {
    if (ids.length === 0) return new Map();
    const res = await fetch(`${this.baseUrl}/pacientes`);
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-entidades al listar pacientes: ${res.status}`,
      );
    const all = (await res.json()) as PacienteRemoto[];
    const idSet = new Set(ids);
    return new Map(
      all.filter((p) => idSet.has(p.id)).map((p) => [p.id, p]),
    );
  }

  async getSucursalesByIds(
    ids: number[],
  ): Promise<Map<number, SucursalRemota>> {
    if (ids.length === 0) return new Map();
    const res = await fetch(`${this.baseUrl}/sucursales`);
    if (!res.ok)
      throw new InternalServerErrorException(
        `Error ms-entidades al listar sucursales: ${res.status}`,
      );
    const all = (await res.json()) as SucursalRemota[];
    const idSet = new Set(ids);
    return new Map(
      all.filter((s) => idSet.has(s.id)).map((s) => [s.id, s]),
    );
  }
}