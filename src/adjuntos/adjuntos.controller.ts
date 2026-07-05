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
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdjuntosService } from './adjuntos.service';
import { multerConfig, MAX_FILES } from './multer.config';

@ApiTags('Archivos y Adjuntos Clínicos') // 👈 Agrupador para la UI
@Controller('adjuntos')
export class AdjuntosController {
  constructor(private readonly service: AdjuntosService) {}

  @Post('paciente/:pacienteId')
  @ApiOperation({ summary: 'Subir y asociar múltiples archivos o imágenes directamente al expediente del paciente' })
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

  @Post('historia/:historiaClinicaId')
  @ApiOperation({ summary: 'Vincular archivos adjuntos a una evolución o registro específico de la historia clínica' })
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

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Consultar la galería completa de archivos adjuntos de un paciente' })
  galeriaPorPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.galeriaPorPaciente(pacienteId);
  }

  @Get('historia/:historiaClinicaId')
  @ApiOperation({ summary: 'Obtener los archivos adjuntos vinculados a una consulta médica específica' })
  galeriaPorHistoria(
    @Param('historiaClinicaId', ParseIntPipe) historiaClinicaId: number,
  ) {
    return this.service.galeriaPorHistoria(historiaClinicaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los metadatos de un archivo adjunto específico por su ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un archivo adjunto del expediente de forma permanente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}