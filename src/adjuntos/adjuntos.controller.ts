import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdjuntosService } from './adjuntos.service';
import { multerConfig, MAX_FILES } from './multer.config';

@Controller('adjuntos')
export class AdjuntosController {
  constructor(private readonly service: AdjuntosService) {}

  // POST /api/v1/adjuntos/paciente/:pacienteId
  // form-data: files[] (imágenes), descripcion? (texto)
  @Post('paciente/:pacienteId')
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, multerConfig))
  uploadPorPaciente(
    @Param('pacienteId', ParseIntPipe) pacienteId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('descripcion') descripcion?: string,
  ) {
    if (!files?.length)
      throw new BadRequestException('Debes enviar al menos un archivo.');
    return this.service.uploadPorPaciente(pacienteId, files, descripcion);
  }

  // POST /api/v1/adjuntos/historia/:historiaClinicaId
  // form-data: files[] (imágenes), descripcion? (texto)
  @Post('historia/:historiaClinicaId')
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, multerConfig))
  uploadPorHistoria(
    @Param('historiaClinicaId', ParseIntPipe) historiaClinicaId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('descripcion') descripcion?: string,
  ) {
    if (!files?.length)
      throw new BadRequestException('Debes enviar al menos un archivo.');
    return this.service.uploadPorHistoria(historiaClinicaId, files, descripcion);
  }

  // GET /api/v1/adjuntos/paciente/:pacienteId
  @Get('paciente/:pacienteId')
  galeriaPorPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.galeriaPorPaciente(pacienteId);
  }

  // GET /api/v1/adjuntos/historia/:historiaClinicaId
  @Get('historia/:historiaClinicaId')
  galeriaPorHistoria(
    @Param('historiaClinicaId', ParseIntPipe) historiaClinicaId: number,
  ) {
    return this.service.galeriaPorHistoria(historiaClinicaId);
  }

  // GET /api/v1/adjuntos/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // DELETE /api/v1/adjuntos/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}