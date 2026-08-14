import { defineConfig } from 'prisma/config';

/**
 * Настройка Prisma. Адрес хранилища живёт здесь, а не в схеме: седьмая редакция принимает его
 * только отсюда — либо через переходник, который получает клиент приёмника.
 */
export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env['DATABASE_URL'] ?? '',
    },
    async adapter(): Promise<import('@prisma/adapter-pg').PrismaPg> {
        const { PrismaPg } = await import('@prisma/adapter-pg');

        return new PrismaPg({ connectionString: process.env['DATABASE_URL'] ?? '' });
    },
});
