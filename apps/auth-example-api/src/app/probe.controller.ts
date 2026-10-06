import { Controller, Get } from '@nestjs/common';

import { OpenOperation } from '@rt-tools/auth-server';

/** The probe the stand waits on before the suite starts. */
@Controller('health')
export class ProbeController {
    @Get()
    @OpenOperation()
    public health(): string {
        return 'ok';
    }
}
