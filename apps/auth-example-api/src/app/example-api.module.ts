import { Module } from '@nestjs/common';

import { AuthServerModule } from '@rt-tools/auth-server';

import { authOptions } from './auth-options';
import { ProbeController } from './probe.controller';
import { RecordsController } from './records.controller';
import { RecordsStore } from './records.store';

@Module({
    imports: [AuthServerModule.forRoot(authOptions(process.env))],
    controllers: [RecordsController, ProbeController],
    providers: [RecordsStore],
})
export class ExampleApiModule {}
