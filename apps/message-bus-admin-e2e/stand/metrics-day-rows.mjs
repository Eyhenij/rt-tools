/**
 * Строки дня копии из базы стенда.
 *
 * Операции чтения у таблицы пока нет, а спеке нужно знать, сколько строк легло и с какими числами:
 * ответ `200` этого не говорит.
 */
import pg from 'pg';

import { STAND_DATABASE_URL } from './stand.mjs';

/** Карты чисел всех строк копии. Строк больше одной быть не должно: спека это и проверяет. */
export async function metricsDayRows(origin) {
    const client = new pg.Client({ connectionString: STAND_DATABASE_URL });

    await client.connect();

    try {
        const found = await client.query('SELECT metrics FROM metrics_day WHERE origin = $1', [origin]);

        return found.rows.map((row) => row.metrics);
    } finally {
        await client.end();
    }
}
