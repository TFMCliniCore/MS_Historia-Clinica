import { Module } from '@nestjs/common';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { HistoriaClinicaService } from './historia-clinica.service';

@Module({
  controllers: [HistoriaClinicaController],
  providers: [HistoriaClinicaService],
})
export class HistoriaClinicaModule {}