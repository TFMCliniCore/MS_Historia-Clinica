import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../external-client/entidades-client.service';
import { UPLOADS_DIR } from './multer.config';

@Injectable()
export class AdjuntosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
  ) {}

  // ── Upload asociado a un paciente ──────────────────────────────────────────
  async uploadPorPaciente(
    pacienteId: number,
    files: Express.Multer.File[],
    descripcion?: string,
  ) {
    const paciente = await this.entidades.getPaciente(pacienteId).catch((err) => {
      this.limpiarArchivos(files);
      throw err;
    });

    return this.prisma.$transaction(
      files.map((file) =>
        this.prisma.adjunto.create({
          data: {
            pacienteId,
            clienteId: paciente.cliente.id,
            nombreArchivo: file.filename,
            nombreOriginal: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            descripcion,
          },
        }),
      ),
    );
  }

  // ── Upload asociado a una consulta específica ──────────────────────────────
  async uploadPorHistoria(
    historiaClinicaId: number,
    files: Express.Multer.File[],
    descripcion?: string,
  ) {
    const historia = await this.prisma.historiaClinica
      .findFirst({ where: { id: historiaClinicaId, eliminado: false } })
      .then((h) => {
        if (!h) {
          this.limpiarArchivos(files);
          throw new NotFoundException(
            `Historia clínica ${historiaClinicaId} no encontrada.`,
          );
        }
        return h;
      });

    const paciente = await this.entidades
      .getPaciente(historia.pacienteId)
      .catch((err) => {
        this.limpiarArchivos(files);
        throw err;
      });

    return this.prisma.$transaction(
      files.map((file) =>
        this.prisma.adjunto.create({
          data: {
            pacienteId: historia.pacienteId,
            clienteId: paciente.cliente.id,
            historiaClinicaId,
            nombreArchivo: file.filename,
            nombreOriginal: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            descripcion,
          },
        }),
      ),
    );
  }

  // ── Galería completa del paciente ──────────────────────────────────────────
  async galeriaPorPaciente(pacienteId: number) {
    await this.entidades.getPaciente(pacienteId);
    return this.prisma.adjunto.findMany({
      where: { pacienteId, eliminado: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Fotos de una consulta ──────────────────────────────────────────────────
  async galeriaPorHistoria(historiaClinicaId: number) {
    const historia = await this.prisma.historiaClinica.findFirst({
      where: { id: historiaClinicaId, eliminado: false },
    });
    if (!historia)
      throw new NotFoundException(
        `Historia clínica ${historiaClinicaId} no encontrada.`,
      );

    return this.prisma.adjunto.findMany({
      where: { historiaClinicaId, eliminado: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.getOrFail(id);
  }

  // ── Soft delete + limpieza del archivo físico ──────────────────────────────
  async remove(id: number) {
    const adjunto = await this.getOrFail(id);

    const deleted = await this.prisma.adjunto.update({
      where: { id },
      data: { eliminado: true },
    });

    const filePath = join(process.cwd(), UPLOADS_DIR, adjunto.nombreArchivo);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        console.warn(`No se pudo eliminar el archivo físico: ${filePath}`);
      }
    }

    return deleted;
  }

  private async getOrFail(id: number) {
    const adjunto = await this.prisma.adjunto.findFirst({
      where: { id, eliminado: false },
    });
    if (!adjunto) throw new NotFoundException(`Adjunto ${id} no encontrado.`);
    return adjunto;
  }

  private limpiarArchivos(files: Express.Multer.File[]) {
    for (const file of files) {
      const filePath = join(process.cwd(), UPLOADS_DIR, file.filename);
      if (existsSync(filePath)) {
        try { unlinkSync(filePath); } catch { /* noop */ }
      }
    }
  }
}