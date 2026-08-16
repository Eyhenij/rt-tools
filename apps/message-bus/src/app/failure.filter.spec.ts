import { ArgumentsHost, BadRequestException, HttpStatus, Logger, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';

import { FailureFilter } from './failure.filter';

/** Ответ: разбор ставит код и отдаёт тело — спека читает и то и другое. */
class ResponseDouble {
    public code: number = 0;
    public body: unknown = null;

    public status(code: number): ResponseDouble {
        this.code = code;

        return this;
    }

    public json(body: unknown): unknown {
        this.body = body;

        return body;
    }
}

/** Отказ клиента хранилища: генератор кладёт свои ошибки классами `PrismaClient*`. */
class PrismaClientKnownRequestError extends Error {
    constructor() {
        super("Can't reach database server at db:5432");
        this.name = 'PrismaClientKnownRequestError';
    }
}

/** Тот же клиент, но с кодом и подробностями: так выглядит колонка, которой в базе нет. */
class PrismaClientColumnMissingError extends Error {
    public readonly code: string = 'P2022';
    public readonly meta: Record<string, unknown> = {
        column: 'city',
        driverAdapterError: { kind: 'postgres', cause: '42703: column "city" does not exist' },
    };

    constructor() {
        super('The column `city` does not exist in the current database.');
        this.name = 'PrismaClientKnownRequestError';
    }
}

/** Строка журнала, какой её видит спека: постоянное имя и поля рядом. */
interface IJournalRecord {
    readonly name: string;
    readonly fields: Record<string, unknown>;
}

function hostWith(path: string, response: ResponseDouble, treeSlug: string | null = 'own-tree'): ArgumentsHost {
    const request: ITreeBearingRequest & { path: string } = { path };

    if (treeSlug) {
        rememberTree(request, { id: 'id-1', slug: treeSlug, name: 'Своё дерево' });
    }

    return {
        switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    } as unknown as ArgumentsHost;
}

/**
 * Журнал приёмника: строки уходят логгером каркаса, и спека читает их с его прототипа. Своего
 * выхода у разбора отказов нет — заводить его ради спеки значило бы проверять не то, что работает.
 */
function journal(): IJournalRecord[] {
    const written: IJournalRecord[] = [];

    vi.spyOn(Logger.prototype, 'warn').mockImplementation((message: unknown, ...tail: readonly unknown[]): void => {
        written.push({ name: String(message), fields: (tail[0] ?? {}) as Record<string, unknown> });
    });

    return written;
}

/** Разобранная причина в полях строки: спека читает её теми же именами, что и журнал. */
function causeOf(record: IJournalRecord): Record<string, unknown> {
    return (record.fields.error ?? {}) as Record<string, unknown>;
}

/** Текст, ушедший спрашивавшему. */
function messageOf(response: ResponseDouble): string {
    return String(Reflect.get(response.body as object, 'message'));
}

/** Номер обращения из текста отказа. Пусто — номера в нём нет. */
function incidentOf(text: string): string | null {
    return /обращение ([0-9a-f]{8})$/.exec(text)?.[1] ?? null;
}

afterEach((): void => {
    vi.restoreAllMocks();
});

describe('FailureFilter', () => {
    it('SC-MB-20 — недоступное хранилище отвечает отказом, а не молчанием', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/intake/summary', response));

        expect(response.code).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(messageOf(response)).toContain('груз не принят, прогон следует повторить');
    });

    it('SC-MB-20 — адрес хранилища дереву не пересказывается', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/intake/summary', response));

        // Сначала — что тело ответа вообще собрано, и только потом, что подробностей в нём нет
        expect(response.body).toHaveProperty('message');
        expect(JSON.stringify(response.body)).not.toContain('db:5432');
    });

    it('SC-MB-7 — незнакомый род груза отбивается перечнем родов, которые приёмник принимает', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new NotFoundException(), hostWith('/api/intake/observations', response));

        expect(response.code).toBe(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'приёмник принимает роды: summary, proposals, postmortems' });
    });

    it('SC-MB-28 — операции выдачи токена у приёмника не находится', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new NotFoundException(), hostWith('/api/trees/token', response));

        expect(response.code).toBe(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'Not Found' });
    });

    it('SC-MB-10 — груз тяжелее предела отбивается, и отказ называет предел', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new PayloadTooLargeException(), hostWith('/api/intake/summary', response));

        expect(response.code).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body).toEqual({ message: 'груз тяжелее предела 2mb' });
    });

    it('SC-MB-30 — отказ записывается в журнал с родом груза и признаком дерева', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new BadRequestException('версия схемы груза обязательна'), hostWith('/api/intake/proposals', response));

        expect(written).toEqual([{ name: 'intake.failed', fields: { cargoKind: 'proposals', treeSlug: 'own-tree', status: 400 } }]);
    });

    it('SC-MB-98 — код клиента хранилища и ответ драйвера стоят в строке своими полями', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new PrismaClientColumnMissingError(), hostWith('/api/intake/summary', response));

        expect(causeOf(written[0])['storageCode']).toBe('P2022');
        expect(causeOf(written[0])['driverCause']).toBe('42703: column "city" does not exist');
    });

    it('SC-MB-30 — в строке журнала нет ни токена, ни текста груза', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(
            new BadRequestException('в грузе рода «предложения» не хватает полей: items'),
            hostWith('/api/intake/proposals', response)
        );

        expect(written).toHaveLength(1);
        expect(JSON.stringify(written[0])).not.toContain('items');
    });

    it('SC-MB-4 — отказ до опознания дерева журнал тоже видит', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(
            new BadRequestException('операция требует токен дерева'),
            hostWith('/api/intake/summary', response, null)
        );

        expect(response.code).toBe(HttpStatus.BAD_REQUEST);
    });

    it('SC-MB-72 — недоступное хранилище на чтении называет номер обращения, и тот же номер стоит в журнале', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/postmortems', response, null));

        const incident: string | null = incidentOf(messageOf(response));

        expect(response.code).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(messageOf(response)).toContain('прочитать не удалось, попытку следует повторить');
        expect(incident).not.toBeNull();
        expect(written[0].name).toBe('request.failed');
        expect(written[0].fields).toMatchObject({ path: '/api/postmortems', status: 503, incident });
    });

    it('SC-MB-72 — незнакомая поломка на чтении отвечает пятисотым с номером обращения', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new TypeError('cannot read properties of undefined'), hostWith('/api/summaries', response, null));

        const incident: string | null = incidentOf(messageOf(response));

        expect(response.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(messageOf(response)).toContain('прочитать не удалось');
        expect(written[0].name).toBe('request.failed');
        expect(written[0].fields).toMatchObject({ path: '/api/summaries', status: 500, incident });
    });

    it('SC-MB-97 — отказ хранилища оставляет в журнале класс ошибки и её текст', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/intake/summary', response));

        expect(causeOf(written[0])['name']).toBe('PrismaClientKnownRequestError');
        expect(causeOf(written[0])['message']).toBe("Can't reach database server at db:5432");
    });

    it('SC-MB-100 — стек поломки в строку журнала попадает срезанным', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new TypeError('cannot read properties of undefined'), hostWith('/api/summaries', response, null));

        expect(String(causeOf(written[0])['stack']).split('\n').length).toBeLessThanOrEqual(12);
    });

    it('SC-MB-101 — отказ по вводу пишется без разобранной причины и без стека', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new BadRequestException('версия схемы груза обязательна'), hostWith('/api/intake/summary', response));

        expect(written[0].fields['error']).toBeUndefined();
    });

    it('SC-MB-72 — устройство поломки наружу не пересказывается', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new TypeError('cannot read properties of undefined'), hostWith('/api/summaries', response, null));

        // Сначала — что текст отказа собран, и только потом, что подробностей в нём нет
        expect(messageOf(response)).toContain('прочитать не удалось');
        expect(messageOf(response)).not.toContain('undefined');
    });

    it('SC-MB-72 — два отказа подряд получают разные номера обращения', () => {
        const first: ResponseDouble = new ResponseDouble();
        const second: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/proposals', first, null));
        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/proposals', second, null));

        expect(incidentOf(messageOf(first))).not.toBe(incidentOf(messageOf(second)));
    });

    it('SC-MB-72 — отказ по вводу номера обращения не называет: причина уже названа', () => {
        const response: ResponseDouble = new ResponseDouble();

        new FailureFilter().catch(
            new BadRequestException('параметр page ожидается целым числом от 1'),
            hostWith('/api/postmortems', response, null)
        );

        expect(messageOf(response)).toBe('параметр page ожидается целым числом от 1');
        expect(incidentOf(messageOf(response))).toBeNull();
    });

    it('SC-MB-20 — недоступное хранилище на приёме тоже называет номер обращения', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: IJournalRecord[] = journal();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/intake/summary', response));

        const incident: string | null = incidentOf(messageOf(response));

        expect(incident).not.toBeNull();
        expect(written[0].name).toBe('intake.failed');
        expect(written[0].fields).toMatchObject({ cargoKind: 'summary', treeSlug: 'own-tree', status: 503, incident });
    });
});
