import { Module } from '@nestjs/common';

import { PrismaModule } from '@rt/message-bus-api/persistence/feature';

import { HealthController } from './health/health.controller';

/** Корневой модуль приёмника. Модули доменов подключаются сюда по мере заведения. */
@Module({
    imports: [PrismaModule],
    controllers: [HealthController],
})
export class AppModule {}
