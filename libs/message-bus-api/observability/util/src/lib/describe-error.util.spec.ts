import { describe, expect, it } from 'vitest';

import { describeError, IErrorDetails, isStorageFailure } from './describe-error.util';

/** Отказ клиента хранилища: генератор кладёт свои ошибки классами `PrismaClient*`. */
class PrismaClientKnownRequestError extends Error {
    public readonly code: string = 'P2022';
    public readonly meta: Record<string, unknown>;

    constructor(message: string, meta: Record<string, unknown> = {}) {
        super(message);
        this.name = 'PrismaClientKnownRequestError';
        this.meta = meta;
    }
}

describe('describeError', () => {
    it('SC-MB-97 — отказ хранилища оставляет класс и текст ошибки', () => {
        const details: IErrorDetails = describeError(new PrismaClientKnownRequestError('column properties.city does not exist'));

        expect(details.name).toBe('PrismaClientKnownRequestError');
        expect(details.message).toBe('column properties.city does not exist');
    });

    it('SC-MB-98 — код хранилища и его подробности стоят своими полями', () => {
        const details: IErrorDetails = describeError(
            new PrismaClientKnownRequestError('column does not exist', { modelName: 'MonthRecord', column: 'city' })
        );

        expect(details.storageCode).toBe('P2022');
        expect(details.storageMeta).toEqual({ modelName: 'MonthRecord', column: 'city' });
    });

    it('SC-MB-98 — ответ драйвера достаётся из подробностей', () => {
        const details: IErrorDetails = describeError(
            new PrismaClientKnownRequestError('column does not exist', {
                driverAdapterError: { kind: 'postgres', cause: '42703: column "city" does not exist' },
            })
        );

        expect(details.driverCause).toBe('42703: column "city" does not exist');
    });

    it('SC-MB-98 — ответ драйвера без причины называется родом отказа', () => {
        const details: IErrorDetails = describeError(
            new PrismaClientKnownRequestError('соединение закрыто', { driverAdapterError: { kind: 'ConnectionClosed' } })
        );

        expect(details.driverCause).toBe('ConnectionClosed');
    });

    it('SC-MB-98 — ошибка не от хранилища кода не получает', () => {
        const details: IErrorDetails = describeError(new Error('обычная поломка'));

        expect(details.storageCode).toBeUndefined();
        expect(details.storageMeta).toBeUndefined();
    });

    it('SC-MB-99 — вложенная причина разворачивается своими полями', () => {
        const inner: Error = new Error('42703: column "city" does not exist');
        inner.name = 'PostgresError';
        const outer: Error = new Error('запрос не выполнен', { cause: inner });

        const details: IErrorDetails = describeError(outer);

        expect(details.cause?.name).toBe('PostgresError');
        expect(details.cause?.message).toBe('42703: column "city" does not exist');
    });

    it('SC-MB-99 — цепочка причин обрывается на пределе глубины', () => {
        let error: Error = new Error('дно');
        for (let level: number = 0; level < 8; level += 1) {
            error = new Error(`уровень ${level}`, { cause: error });
        }

        let details: IErrorDetails | undefined = describeError(error);
        let depth: number = 0;
        while (details?.cause) {
            details = details.cause;
            depth += 1;
        }

        expect(depth).toBe(4);
    });

    it('SC-MB-100 — стек пишется срезанным', () => {
        const error: Error = new Error('поломка');
        error.stack = ['Error: поломка', ...Array.from({ length: 40 }, (_: unknown, line: number) => `    at шаг${line}`)].join('\n');

        const details: IErrorDetails = describeError(error);

        expect(details.stack?.split('\n')).toHaveLength(12);
    });

    it('SC-MB-97 — брошенная строка тоже разбирается, а не теряется', () => {
        const details: IErrorDetails = describeError('всё сломалось');

        expect(details.name).toBe('ThrownString');
        expect(details.message).toBe('всё сломалось');
    });

    it('SC-MB-97 — брошенный объект разбирается своим текстом', () => {
        const details: IErrorDetails = describeError({ reason: 'нет связи' });

        expect(details.name).toBe('ThrownObject');
        expect(details.message).toBe('{"reason":"нет связи"}');
    });
});

describe('isStorageFailure', () => {
    it('SC-MB-97 — отказ клиента хранилища узнаётся именем класса', () => {
        expect(isStorageFailure(new PrismaClientKnownRequestError('нет связи'))).toBe(true);
        expect(isStorageFailure(new Error('обычная поломка'))).toBe(false);
        expect(isStorageFailure('строка')).toBe(false);
    });
});
