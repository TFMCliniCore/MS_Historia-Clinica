import { Global, Module } from '@nestjs/common';
import { EntidadesClientService } from './entidades-client.service';
import { AgendaClientService } from './agenda-client.service';

@Global()
@Module({
  providers: [EntidadesClientService, AgendaClientService],
  exports: [EntidadesClientService, AgendaClientService],
})
export class ExternalClientModule {}