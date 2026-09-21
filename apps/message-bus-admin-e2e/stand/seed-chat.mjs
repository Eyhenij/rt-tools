/**
 * Засев чата стенда: пространство, сайты, оператор и разговоры на них.
 *
 * Разговоры кладутся приёмом — теми же двумя операциями, которыми их кладёт виджет посетителя:
 * набор проверяет, что панель читает то, что положил приём, и записи, вставленные мимо приёма,
 * отвечали бы на другой вопрос. Мимо приёма идёт только то, чего приём не умеет: пространство,
 * сайты и сама запись оператора — операций у них нет ни одной, их заводит владелец сервиса.
 *
 * Оператор привязывается к учётной записи набора запросом с подзапросом: признак записи засев
 * не читает — `prisma db execute` строк не возвращает.
 *
 * Времена реплик правятся прямым запросом: приёмник ставит их часами машины, и весь засев
 * ложится в одну секунду — порядок «свежий разговор сверху» на таких данных не отличить от
 * любого другого.
 */
import { ADMIN_ORIGIN, ADMIN_PAGE_ORIGIN, API_ORIGIN, CHAT } from './stand.mjs';

/** Минута, от которой считаются времена разговоров: она же стоит в спеках раздела. */
const FIRST_MOMENT = '2026-09-19 09:00:00';

/** Заведение переписки и первая реплика посетителя одним заходом. */
async function talk(site, text) {
    const started = await fetch(`${API_ORIGIN}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: site.origin },
        body: JSON.stringify({ site: site.key }),
    });

    if (!started.ok) {
        throw new Error(`чат стенда: переписка не завелась, ответ ${started.status}`);
    }

    const { conversationId, visitorToken } = await started.json();
    const taken = await fetch(`${API_ORIGIN}/api/chat/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: site.origin },
        body: JSON.stringify({ site: site.key, visitor: visitorToken, conversation: conversationId, text }),
    });

    if (!taken.ok) {
        throw new Error(`чат стенда: реплика не принята, ответ ${taken.status}`);
    }

    return conversationId;
}

/** Ответ оператора: кладётся прямым запросом — операция закрыта входом, а засев идёт без него. */
function answerSql(conversationId, text, shift) {
    return [
        `INSERT INTO "chat_message" ("id", "conversationId", "side", "text", "takenAt")`,
        `VALUES ('chat-answer-${shift}', '${conversationId}', 'operator', '${text}',`,
        `    TIMESTAMP '${FIRST_MOMENT}' + (${shift} * INTERVAL '1 minute'));`,
    ].join('\n');
}

/**
 * Часы площадки, в которые набор не попадает никогда: час вперёд от минуты засева.
 *
 * Считаются от минуты засева, а не записаны числами: записанные, они однажды накрыли бы собой
 * минуту прогона, и проверка «вне часов» стала бы зелёной на любом поведении виджета.
 */
function closedHours(at = new Date()) {
    const minute = at.getUTCHours() * 60 + at.getUTCMinutes();

    return { from: (minute + 60) % 1440, to: (minute + 120) % 1440 };
}

/** Пространство, сайты и оператор: у них операций нет, и заводит их засев. */
function recordsSql() {
    const closed = closedHours();

    return [
        `INSERT INTO "chat_space" ("id", "name") VALUES ('chat-space-stand', '${CHAT.space}');`,
        `INSERT INTO "chat_site" ("id", "spaceId", "name", "key", "origins", "enabled") VALUES`,
        `    ('${CHAT.own.id}', 'chat-space-stand', '${CHAT.own.name}', '${CHAT.own.key}', ARRAY['${CHAT.own.origin}'], true),`,
        `    ('${CHAT.foreign.id}', 'chat-space-stand', '${CHAT.foreign.name}', '${CHAT.foreign.key}', ARRAY['${CHAT.foreign.origin}'], true);`,
        `INSERT INTO "chat_site" ("id", "spaceId", "name", "key", "origins", "enabled", "greeting", "answerFrom", "answerTo", "timeZone")`,
        `VALUES`,
        `    ('${CHAT.widget.id}', 'chat-space-stand', '${CHAT.widget.name}', '${CHAT.widget.key}', ARRAY['${ADMIN_ORIGIN}', '${ADMIN_PAGE_ORIGIN}'], true,`,
        `        '${CHAT.widget.greeting}', 0, 1439, 'UTC'),`,
        `    ('${CHAT.widgetClosed.id}', 'chat-space-stand', '${CHAT.widgetClosed.name}', '${CHAT.widgetClosed.key}',`,
        `        ARRAY['${ADMIN_ORIGIN}', '${ADMIN_PAGE_ORIGIN}'], true, '${CHAT.widgetClosed.greeting}', ${closed.from}, ${closed.to}, 'UTC');`,
    ].join('\n');
}

/** Оператор набора: он отвечает за первый сайт и не отвечает за соседский. */
function operatorSql(accountName) {
    return [
        `INSERT INTO "chat_operator" ("id", "spaceId", "accountId")`,
        `SELECT 'chat-operator-stand', 'chat-space-stand', "id" FROM "account" WHERE "name" = '${accountName}';`,
        `INSERT INTO "chat_operator_site" ("operatorId", "siteId") VALUES`,
        `    ('chat-operator-stand', '${CHAT.own.id}'),`,
        `    ('chat-operator-stand', '${CHAT.widget.id}');`,
    ].join('\n');
}

/**
 * Чат стенда целиком.
 *
 * Зовётся после засева учётных записей: оператор привязан к записи набора, и без неё привязывать
 * его не к чему.
 */
export async function seedChat(sql, accountName) {
    await sql(recordsSql());
    await sql(operatorSql(accountName));

    const own = [];

    for (const asked of CHAT.talks) {
        own.push(await talk(CHAT.own, asked.text));
    }

    await talk(CHAT.foreign, CHAT.foreignTalk);

    const script = [];

    CHAT.talks.forEach((asked, index) => {
        const shift = index + 1;

        script.push(
            [
                `UPDATE "chat_message" SET "takenAt" = TIMESTAMP '${FIRST_MOMENT}' + (${shift} * INTERVAL '1 hour')`,
                `WHERE "conversationId" = '${own[index]}' AND "side" = 'visitor';`,
                `UPDATE "chat_conversation" SET "lastMessageAt" = TIMESTAMP '${FIRST_MOMENT}' + (${shift} * INTERVAL '1 hour')`,
                `WHERE "id" = '${own[index]}';`,
            ].join('\n')
        );

        if (asked.answer) {
            script.push(answerSql(own[index], asked.answer, shift));
        }

        if (asked.closed) {
            script.push(`UPDATE "chat_conversation" SET "state" = 'closed' WHERE "id" = '${own[index]}';`);
        }
    });

    await sql(script.join('\n'));
}
