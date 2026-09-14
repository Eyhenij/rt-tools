export * from './lib/observations.module';
export * from './lib/summaries-read.controller';
export * from './lib/summary-intake.controller';
export * from './lib/usage-read.controller';
export * from './lib/observations-intake.controller';
export * from './lib/observation-retention.service';
// Предел строк читает и подъём службы — для сводки подъёма; приложение видит домен через feature
export { observationLinesCap } from '@rt/message-bus-api/observations/util';
