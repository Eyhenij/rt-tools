import { Module } from '@nestjs/common';

import { authOptionsFromEnv, AuthServerModule } from '@rt-tools/auth-server';

import { ProbeController } from './probe.controller';
import { RecordsController } from './records.controller';
import { RecordsStore } from './records.store';
import { EXAMPLE_RIGHTS } from './rights';

@Module({
    imports: [AuthServerModule.forRoot(authOptionsFromEnv(process.env, EXAMPLE_RIGHTS))],
    controllers: [RecordsController, ProbeController],
    providers: [RecordsStore],
})
export class ExampleApiModule {}
