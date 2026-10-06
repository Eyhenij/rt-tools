/**
 * Люди стенда: запись набора и люди, которых показывает раздел людей.
 *
 * Входят они через Keycloak: каждый заводится в области стенда с правами ролями клиента шины.
 * Строки раздела людей кладутся запросом к базе стенда — раздел показывает учётные записи
 * приёмника, а заводить их операцией нечем: вход по паре ушёл, и раздел людей уходит следом.
 *
 * Запрос к хранилищу приезжает доводом, а не берётся здесь заново: он завязан на адрес базы
 * стенда, и второй его сборкой этот файл отвечал бы на вопрос об адресе второй раз.
 */
import { seedRealmPeople } from '../../../tools/keycloak-stand.mjs';

import { ACCOUNT, ALL_RIGHTS, CLIENT, KEYCLOAK_ORIGIN, PEOPLE, REALM, STAND_PASSWORD, WATCHER_RIGHTS, WATCHER_ROLE } from './stand.mjs';

/**
 * Заводит людей в Keycloak и строки раздела людей. Отвечает ключом записи набора в Keycloak: им
 * приёмник узнаёт вошедшего, и им же записан оператор чата.
 */
export async function seedPeople(sql) {
    const ids = await seedRealmPeople({
        origin: KEYCLOAK_ORIGIN,
        realm: REALM,
        clientId: CLIENT,
        password: STAND_PASSWORD,
        people: [ACCOUNT, ...Object.values(PEOPLE)],
    });

    await sql([roleSql('owner', 'Владелец', ALL_RIGHTS), roleSql('watcher', WATCHER_ROLE, WATCHER_RIGHTS)].join('\n'));
    await sql([ACCOUNT, ...Object.values(PEOPLE)].map((person) => accountSql(person, ids.get(person.email))).join('\n'));
    await peopleMoments(sql);

    return ids.get(ACCOUNT.email);
}

function list(rights) {
    return rights.length ? `ARRAY[${rights.map((right) => `'${right}'`).join(', ')}]` : `'{}'::text[]`;
}

function roleSql(key, name, rights) {
    return `INSERT INTO "role" ("id", "key", "name", "rights") VALUES (gen_random_uuid(), '${key}', '${name}', ${list(rights)});`;
}

/**
 * Строка раздела людей. Ключ строки — ключ человека в Keycloak: им приёмник узнаёт вошедшего, и
 * отказ отключить свою запись сверяет именно его. Роль — та, чьи права у человека в Keycloak;
 * пароля у строки нет, поле хеша держит метку стенда.
 */
function accountSql(person, id) {
    const role = person.rights === ALL_RIGHTS ? 'owner' : person.rights === WATCHER_RIGHTS ? 'watcher' : null;
    const roleId = role ? `(SELECT "id" FROM "role" WHERE "key" = '${role}')` : 'NULL';

    return [
        `INSERT INTO "account" ("id", "name", "nameKey", "passwordHash", "roleId")`,
        `    VALUES ('${id}', '${person.name}', '${person.name.trim().toLowerCase()}', 'stand:no-password', ${roleId});`,
    ].join('\n');
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
