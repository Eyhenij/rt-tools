/**
 * Учётные записи стенда: запись самого набора с её ролью и люди, которых показывает раздел людей.
 *
 * Стоит отдельным файлом от остального засева: тот кладёт груз приёмом, а здесь записи заводятся
 * теми же операциями, какими их заводит человек, — первая запись экраном первичной настройки,
 * остальные разделом людей. Мимо операций идут роли и времена: ролей из веба стенду не нужно
 * больше одной, а время приёмник пишет часами машины.
 *
 * Запрос к хранилищу приезжает доводом, а не берётся здесь заново: он завязан на адрес базы
 * стенда, и второй его сборкой этот файл отвечал бы на вопрос об адресе второй раз.
 */
import { ACCOUNT, API_ORIGIN, PEOPLE, WATCHER_ROLE } from './stand.mjs';

/**
 * Учётная запись стенда: первая запись узла, заведённая тем же запросом, каким её заводит экран
 * первичной настройки. Ответ несёт куку входа — ею дальше заводятся люди.
 *
 * Роль владельца кладётся до запроса: вычистка стирает и роли, а заведение первой записи без
 * роли владельца отказывает по устройству.
 */
export async function seedAccount(sql) {
    await role(sql);

    const answer = await fetch(`${API_ORIGIN}/api/setup`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: ACCOUNT.name, password: ACCOUNT.password }),
    });

    if (!answer.ok) {
        throw new Error(`первая запись стенда не заведена: ${answer.status} ${await answer.text()}`);
    }

    const cookie = answer.headers.get('set-cookie')?.split(';')[0] ?? '';

    if (cookie === '') {
        throw new Error('первая запись стенда заведена без куки входа: людей заводить нечем');
    }

    return cookie;
}

/**
 * Роль записи стенда: все права разом.
 *
 * Права здесь у всех, потому что набор проверяет разделы, а не права: само сложение прав и два
 * отказа проверяются вызовом, спеками приёмника. Без роли запись прав не имеет ни одного, и весь
 * набор покраснел бы на пустой админке — ни один сценарий при этом не был бы о правах.
 *
 * Имена перечислены здесь, а не собраны из кода приёмника: набор, взятый из того же кода, что
 * проверяется, подтвердил бы сам себя. Разойдётся перечень с набором — стенд скажет об этом
 * сразу: раздел, права на который не нашлось, исчезнет с экрана.
 */
async function role(sql) {
    const rights = [
        'postmortems:read',
        'postmortems:manage',
        'proposals:read',
        'proposals:manage',
        'summaries:read',
        'usage:read',
        'invites:read',
        'invites:manage',
        'accounts:read',
        'accounts:manage',
        'roles:manage',
        'chat:read',
    ]
        .map((right) => `'${right}'`)
        .join(', ');

    await sql(`INSERT INTO "role" ("id", "key", "name", "rights") VALUES (gen_random_uuid(), 'owner', 'Владелец', ARRAY[${rights}]);`);
}

/**
 * Люди стенда: те, кого показывает раздел людей.
 *
 * Заводятся операциями раздела людей под кукой записи набора — так же, как их заводит человек с
 * экрана. Отключение идёт своей операцией, а роль и времена ставятся запросом: время последнего
 * входа приёмник пишет часами машины, и оставленное как есть оно меняло бы порядок списка от
 * прогона к прогону.
 *
 * Время последнего входа наблюдателя стоит в прошлом только до его первого входа: спека про
 * раздел без права входит именно им, и после неё значение — сегодняшнее. Поэтому список людей
 * судится по строке, найденной именем, а не по её месту в порядке.
 */
export async function seedPeople(cookie, sql) {
    for (const person of Object.values(PEOPLE)) {
        await people(cookie, '', { name: person.name, password: person.password });
    }

    await people(cookie, `/${encodeURIComponent(PEOPLE.disabled.name)}/disable`, null);
    await watcherRole(sql);
    await peopleMoments(sql);
}

/** Операция раздела людей под кукой входа: заведение и отключение. */
async function people(cookie, path, body) {
    const answer = await fetch(`${API_ORIGIN}/api/accounts${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
        body: body === null ? undefined : JSON.stringify(body),
    });

    if (!answer.ok) {
        throw new Error(`операция людей «${path || 'заведение'}» отбита: ${answer.status} ${await answer.text()}`);
    }
}

/**
 * Роль наблюдателя: права на все четыре раздела груза, на чат — и ни одного права на людей.
 *
 * Ею набор входит, проверяя, что раздел людей без права `accounts:read` не показан и не
 * открывается. Роль без единого права ответила бы на другой вопрос: вошедший без прав не видит
 * ни одного раздела вообще, и пропажа пункта людей ничего не значила бы.
 *
 * Право на чат у наблюдателя есть, а записи оператора чата — нет: им набор проверяет, что
 * вошедший с правом, но не оператор, видит пустой список, а не отказ. Право и принадлежность
 * сайтам — разные вопросы, и без такого человека их не различить.
 */
async function watcherRole(sql) {
    const rights = ['postmortems:read', 'proposals:read', 'summaries:read', 'usage:read', 'invites:read', 'chat:read']
        .map((right) => `'${right}'`)
        .join(', ');

    await sql(
        [
            `INSERT INTO "role" ("id", "key", "name", "rights") VALUES (gen_random_uuid(), 'watcher', '${WATCHER_ROLE}', ARRAY[${rights}]);`,
            `UPDATE "account" SET "roleId" = (SELECT "id" FROM "role" WHERE "key" = 'watcher')`,
            `    WHERE "name" IN ('${PEOPLE.watcher.name}', '${PEOPLE.disabled.name}');`,
        ].join('\n')
    );
}

/**
 * Времена людей стенда.
 *
 * Ставятся постоянными: время последнего входа стоит колонкой на экране и им же идёт порядок по
 * умолчанию, а посчитанное часами машины оно и двигало бы кадр, и меняло бы порядок строк.
 * Записи без роли время входа не ставится вовсе — ею ни разу не входили, и раздел обязан сказать
 * об этом словами.
 */
async function peopleMoments(sql) {
    await sql(
        [
            `UPDATE "account" SET "createdAt" = TIMESTAMP '2026-08-01 05:00:00' WHERE "name" <> '${ACCOUNT.name}';`,
            `UPDATE "account" SET "lastLoginAt" = TIMESTAMP '2026-08-04 11:30:00' WHERE "name" = '${PEOPLE.watcher.name}';`,
            `UPDATE "account" SET "lastLoginAt" = TIMESTAMP '2026-08-02 08:15:00', "disabledAt" = TIMESTAMP '2026-08-03 16:00:00'`,
            `    WHERE "name" = '${PEOPLE.disabled.name}';`,
        ].join('\n')
    );
}
