/**
 * Учётные записи стенда: запись самого набора с её ролью и люди, которых показывает раздел людей.
 *
 * Стоит отдельным файлом от остального засева: тот кладёт груз приёмом, а здесь заводится то,
 * чего приём не умеет, — запись человека командой строки запуска и её роль прямым запросом.
 *
 * Команда и запрос приезжают доводами, а не берутся здесь заново: обе завязаны на адрес базы
 * стенда, и второй их сборкой этот файл отвечал бы на вопрос об адресе второй раз.
 */
import { ACCOUNT, PEOPLE, WATCHER_ROLE } from './stand.mjs';

/**
 * Учётная запись стенда.
 *
 * Пароль уходит команде через стандартный ввод — тем же путём, каким его вводит владелец: доводом
 * он остался бы и в истории оболочки, и в списке процессов машины.
 */
export async function seedAccount(command, sql) {
    await command(['account:add', ACCOUNT.name], `${ACCOUNT.password}\n`);
    await role(sql);
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
    ]
        .map((right) => `'${right}'`)
        .join(', ');

    await sql(`INSERT INTO "role" ("id", "key", "name", "rights") VALUES (gen_random_uuid(), 'owner', 'Владелец', ARRAY[${rights}]);`);
    await sql('UPDATE "account" SET "roleId" = (SELECT "id" FROM "role" WHERE "key" = \'owner\');');
}

/**
 * Люди стенда: те, кого показывает раздел людей.
 *
 * Заводятся той же командой строки запуска, что и запись набора, — заведения человека из веба
 * нет вовсе. Отключение идёт своей командой, а роль и времена ставятся запросом: ролей из веба
 * тоже не заводят, а время последнего входа приёмник пишет часами машины, и оставленное как есть
 * оно меняло бы порядок списка от прогона к прогону.
 *
 * Идёт после записи набора намеренно: та раздаёт роль владельца всем записям разом, и заведённые
 * до неё получили бы права, которых у них быть не должно, — вместе с разделом, закрытым правом.
 *
 * Время последнего входа наблюдателя стоит в прошлом только до его первого входа: спека про
 * раздел без права входит именно им, и после неё значение — сегодняшнее. Поэтому список людей
 * судится по строке, найденной именем, а не по её месту в порядке.
 */
export async function seedPeople(command, sql) {
    for (const person of Object.values(PEOPLE)) {
        await command(['account:add', person.name], `${person.password}\n`);
    }

    await command(['account:disable', PEOPLE.disabled.name]);
    await watcherRole(sql);
    await peopleMoments(sql);
}

/**
 * Роль наблюдателя: права на все четыре раздела груза и ни одного права на людей.
 *
 * Ею набор входит, проверяя, что раздел людей без права `accounts:read` не показан и не
 * открывается. Роль без единого права ответила бы на другой вопрос: вошедший без прав не видит
 * ни одного раздела вообще, и пропажа пункта людей ничего не значила бы.
 */
async function watcherRole(sql) {
    const rights = ['postmortems:read', 'proposals:read', 'summaries:read', 'invites:read'].map((right) => `'${right}'`).join(', ');

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
