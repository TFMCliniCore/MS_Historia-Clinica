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
import { HistoriaClinicaService } from './historia-clinica.service';
import { CreateHistoriaClinicaDto } from './dto/create-historia-clinica.dto';
import { UpdateHistoriaClinicaDto } from './dto/update-historia-clinica.dto';

@Controller('historia-clinica')
export class HistoriaClinicaController {
  constructor(private readonly service: HistoriaClinicaService) {}

  @Post()
  create(@Body() dto: CreateHistoriaClinicaDto) {
    return this.service.create(dto);
  }

  @Get()
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
  getFicha(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.getFichaPaciente(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoriaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoriaClinicaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}