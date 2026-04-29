import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ExternalClientModule } from './external-client/external-client.module';
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module';
import { AdjuntosModule } from './adjuntos/adjuntos.module';
import { AgendaModule } from './agenda/agenda.module';

@Module({
  imports: [
    PrismaModule,
    ExternalClientModule,
    HistoriaClinicaModule,
    AdjuntosModule,
    AgendaModule,
  ],
})
export class AppModule {}