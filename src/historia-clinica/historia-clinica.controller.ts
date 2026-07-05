import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { HistoriaClinicaService } from './historia-clinica.service';
import { CreateHistoriaClinicaDto } from './dto/create-historia-clinica.dto';
import { UpdateHistoriaClinicaDto } from './dto/update-historia-clinica.dto';

@ApiTags('Expedientes e Historias Clínicas')
@Controller('historia-clinica')
export class HistoriaClinicaController {
  constructor(private readonly service: HistoriaClinicaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva entrada o evolución médica en la historia clínica' })
  create(@Body() dto: CreateHistoriaClinicaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar y filtrar registros de historias clínicas por paciente, sucursal, rango de fechas o estado de pago' })
  findAll(
    @Query('pacienteId') pacienteId?: string,
    @Query('sucursalId') sucursalId?: string,
    @Query('pagado') pagado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
      sucursalId: sucursalId ? Number(sucursalId) : undefined,
      pagado: pagado !== undefined ? pagado === 'true' : undefined,
      desde,
      hasta,
    });
  }

  @Get('ficha/:pacienteId')
  @ApiOperation({ summary: 'Obtener la ficha clínica consolidada del paciente (resumen y antecedentes)' })
  getFicha(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.getFichaPaciente(pacienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una evolución médica detallada mediante su ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar de forma parcial los datos de una entrada clínica' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoriaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar por completo el cuerpo informático de una entrada médica' })
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoriaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover una evolución del registro activo (auditable)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}