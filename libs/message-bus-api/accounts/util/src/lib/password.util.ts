/**
 * Пароль учётной записи: хеш, сверка и ответ равной длительности на неизвестное имя.
 *
 * В хранилище лежит только хеш: снятый дамп базы входа не даёт. Растягивание здесь обязательно —
 * в отличие от токена дерева пароль выбирает человек, и выбрать он может короткий; перебор по
 * такому окупается при любой скорости простого хеша.
 *
 * Чистые функции, хранилища не знают: их зовут команда заведения, смена пароля и вход, а спеке
 * база не нужна вовсе.
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Длина соли в байтах. Соль своя у каждой записи: общая свела бы растягивание к одной таблице. */
const SALT_BYTES: number = 16;

/** Длина хеша в байтах. */
const KEY_BYTES: number = 64;

/**
 * Во сколько раз дороже делается один перебор. Значение стоит в самом хеше, поэтому поднять его
 * можно, не трогая уже заведённых записей: старый хеш проверяется своим числом, новый — новым.
 */
const COST: number = 16384;

/** Чем поля хеша разделены в строке хранилища. */
const PART: string = '$';

/**
 * Хеш пароля в виде, который целиком лежит в одной колонке: стоимость, соль и сам хеш.
 *
 * Разбирается он обратно сверкой — отдельных колонок под соль и стоимость нет намеренно: три
 * колонки расходятся между собой при первой же правке, а строка переезжает одной.
 */
export function passwordHash(password: string): string {
    const salt: Buffer = randomBytes(SALT_BYTES);
    const key: Buffer = scryptSync(password, salt, KEY_BYTES, { N: COST });

    return [String(COST), salt.toString('hex'), key.toString('hex')].join(PART);
}

/**
 * Сошёлся ли пароль с хешем.
 *
 * Сравнение за постоянное время: побайтовое прерывается на первом несовпадении, и по времени
 * ответа хеш добирается посимвольно. Неразобранный хеш — не отказ вызывающему, а порча
 * хранилища: сверка отвечает «не сошлось», и вход не заводится.
 */
export function passwordMatches(password: string, stored: string): boolean {
    const [cost, salt, key]: string[] = stored.split(PART);

    if (!cost || !salt || !key) {
        return false;
    }

    const expected: Buffer = Buffer.from(key, 'hex');
    const actual: Buffer = scryptSync(password, Buffer.from(salt, 'hex'), expected.length, { N: Number(cost) });

    return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Хеш-заглушка: с ней сверяется пароль, когда учётной записи с таким именем нет вовсе.
 *
 * Без неё неизвестное имя отвергается сразу, а неверный пароль — после растягивания, и разница
 * во времени ответа перебирает имена учётных записей ровно так, как запрещает правило об отказе
 * входа. Считается один раз при загрузке: считать её на каждую попытку значит платить временем
 * растягивания дважды.
 */
const ABSENT_ACCOUNT_HASH: string = passwordHash(randomBytes(KEY_BYTES).toString('hex'));

/**
 * Потратить на неизвестное имя столько же, сколько на известное.
 *
 * Возвращает всегда `false`: сверять здесь нечего, и звать это следует ровно там, где записи
 * не нашлось.
 */
export function burnAbsentAccountTime(password: string): boolean {
    return passwordMatches(password, ABSENT_ACCOUNT_HASH);
}
