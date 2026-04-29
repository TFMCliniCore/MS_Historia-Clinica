import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../external-client/entidades-client.service';
import { AgendaClientService } from '../external-client/agenda-client.service';
import { CreateHistoriaClinicaDto } from './dto/create-historia-clinica.dto';
import { UpdateHistoriaClinicaDto } from './dto/update-historia-clinica.dto';

const INCLUDE_ADJUNTOS = {
  adjuntos: {
    where: { eliminado: false },
    orderBy: { createdAt: 'desc' as const },
  },
};

@Injectable()
export class HistoriaClinicaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
    private readonly agenda: AgendaClientService,
  ) {}

  async create(dto: CreateHistoriaClinicaDto) {
    await Promise.all([
      this.entidades.getPaciente(dto.pacienteId),
      this.entidades.getSucursal(dto.sucursalId),
    ]);

    return this.prisma.historiaClinica.create({
      data: {
        ...dto,
        fecha: new Date(dto.fecha),
        costo: dto.costo ? parseFloat(dto.costo) : undefined,
        pagado: dto.pagado ?? false,
      },
      include: INCLUDE_ADJUNTOS,
    });
  }

  async findAll(filters: {
    pacienteId?: number;
    sucursalId?: number;
    pagado?: boolean;
    desde?: string;
    hasta?: string;
  }) {
    const historias = await this.prisma.historiaClinica.findMany({
      where: {
        eliminado: false,
        ...(filters.pacienteId && { pacienteId: filters.pacienteId }),
        ...(filters.sucursalId && { sucursalId: filters.sucursalId }),
        ...(filters.pagado !== undefined && { pagado: filters.pagado }),
        ...(filters.desde && { fecha: { gte: new Date(filters.desde) } }),
        ...(filters.hasta && { fecha: { lte: new Date(filters.hasta) } }),
      },
      include: INCLUDE_ADJUNTOS,
      orderBy: { fecha: 'desc' },
    });

    if (historias.length === 0) return [];

    const pacienteIds = [...new Set(historias.map((h) => h.pacienteId))];
    const sucursalIds = [...new Set(historias.map((h) => h.sucursalId))];

    const [pacientesMap, sucursalesMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getSucursalesByIds(sucursalIds),
    ]);

    return historias.map((h) => ({
      ...h,
      paciente: pacientesMap.get(h.pacienteId) ?? null,
      sucursal: sucursalesMap.get(h.sucursalId) ?? null,
    }));
  }

  async findOne(id: number) {
    const historia = await this.getOrFail(id);
    const [paciente, sucursal] = await Promise.all([
      this.entidades.getPaciente(historia.pacienteId),
      this.entidades.getSucursal(historia.sucursalId),
    ]);
    return { ...historia, paciente, sucursal };
  }

  async getFichaPaciente(pacienteId: number) {
    const [paciente, historias, citas, recordatorios] = await Promise.all([
      this.entidades.getPaciente(pacienteId),
      this.prisma.historiaClinica.findMany({
        where: { pacienteId, eliminado: false },
        include: INCLUDE_ADJUNTOS,
        orderBy: { fecha: 'desc' },
      }),
      this.agenda.getCitasByPaciente(pacienteId),
      this.agenda.getRecordatoriosByPaciente(pacienteId),
    ]);
    return { paciente, historias, citas, recordatorios };
  }

  async update(id: number, dto: UpdateHistoriaClinicaDto) {
    await this.getOrFail(id);
    if (dto.pacienteId) await this.entidades.getPaciente(dto.pacienteId);
    if (dto.sucursalId) await this.entidades.getSucursal(dto.sucursalId);

    return this.prisma.historiaClinica.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        ...(dto.costo !== undefined && {
          costo: dto.costo ? parseFloat(dto.costo) : null,
        }),
      },
      include: INCLUDE_ADJUNTOS,
    });
  }

  async remove(id: number) {
    await this.getOrFail(id);
    return this.prisma.historiaClinica.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  private async getOrFail(id: number) {
    const historia = await this.prisma.historiaClinica.findFirst({
      where: { id, eliminado: false },
      include: INCLUDE_ADJUNTOS,
    });
    if (!historia)
      throw new NotFoundException(`Historia clínica ${id} no encontrada.`);
    return historia;
  }
}