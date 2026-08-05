import { IQuillDelta, IQuillDeltaAttributes, IQuillDeltaOp } from './quill-delta.model';

/** Значение — ровно `true` (флаговые атрибуты). */
function isTrue(value: unknown): boolean {
    return value === true;
}

/** Per-key валидаторы whitelist: ключа нет в карте ⇒ атрибут запрещён. */
const ATTR_VALIDATORS: ReadonlyMap<string, (value: unknown) => boolean> = new Map<string, (value: unknown) => boolean>([
    ['bold', isTrue],
    ['italic', isTrue],
    ['underline', isTrue],
    ['strike', isTrue],
    ['blockquote', isTrue],
    ['code-block', isTrue],
    ['list', (value: unknown): boolean => value === 'ordered' || value === 'bullet'],
    ['header', (value: unknown): boolean => value === 1 || value === 2 || value === 3],
]);

/** Объект без прототипных сюрпризов — узкая guard-проверка. */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/** Все ключи атрибутов — из whitelist и с валидным значением. */
function isValidAttributes(raw: Record<string, unknown>): boolean {
    return Object.keys(raw).every((key: string): boolean => {
        const validate: ((value: unknown) => boolean) | undefined = ATTR_VALIDATORS.get(key);
        return validate !== undefined && validate(raw[key]);
    });
}

/** Нормализует одну op; `null` — если форма нарушена (весь delta тогда отвергается). */
function normalizeOp(op: unknown): IQuillDeltaOp | null {
    if (!isRecord(op)) {
        return null;
    }
    const insert: unknown = op['insert'];
    if (typeof insert !== 'string') {
        return null;
    }
    if (Object.keys(op).some((key: string): boolean => key !== 'insert' && key !== 'attributes')) {
        return null;
    }
    const attrs: unknown = op['attributes'];
    if (attrs === undefined) {
        return { insert };
    }
    if (!isRecord(attrs) || Object.keys(attrs).length === 0 || !isValidAttributes(attrs)) {
        return null;
    }
    return { insert, attributes: attrs as unknown as IQuillDeltaAttributes };
}

/**
 * Приводит сырой вывод Quill 2 к контракту `IQuillDelta`. Quill 2 хранит в
 * `code-block` язык подсветки (по умолчанию строку `"plain"`), тогда как контракт
 * и бэк ждут флаг `true`; без приведения бэк отвергает delta как
 * `invalid_message_delta`. Остальные атрибуты уже в нужной форме — их не трогаем.
 */
export function coerceQuillDeltaOutput(delta: IQuillDelta): IQuillDelta {
    return {
        ops: delta.ops.map((op: IQuillDeltaOp): IQuillDeltaOp => {
            const attrs: Record<string, unknown> | undefined = op.attributes as unknown as Record<string, unknown> | undefined;
            const codeBlock: unknown = attrs?.['code-block'];
            if (attrs === undefined || codeBlock === undefined || codeBlock === true) {
                return op;
            }
            return {
                ...op,
                attributes: { ...op.attributes, 'code-block': true },
            };
        }),
    };
}

/**
 * Defensive-нормализация тела rich-сообщения: пропускает только строго валидную
 * форму (top-level `{ops}`, `ops` непустой массив, `insert` — строка, `attributes`
 * непустой и из whitelist), иначе `null` — сообщение отрендерится plain-фолбэком
 * по `message`. Бэк гарантирует форму, но рендер не доверяет входу вслепую.
 */
export function normalizeQuillDelta(raw: unknown): IQuillDelta | null {
    if (!isRecord(raw)) {
        return null;
    }
    const ops: unknown = raw['ops'];
    if (!Array.isArray(ops) || ops.length === 0) {
        return null;
    }
    const clean: IQuillDeltaOp[] = [];
    for (const op of ops) {
        const normalized: IQuillDeltaOp | null = normalizeOp(op);
        if (normalized === null) {
            return null;
        }
        clean.push(normalized);
    }
    return { ops: clean };
}
