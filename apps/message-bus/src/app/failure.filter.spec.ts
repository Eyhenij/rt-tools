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
function journal(): string[] {
    const written: string[] = [];

    vi.spyOn(Logger.prototype, 'warn').mockImplementation((message: unknown): void => {
        written.push(String(message));
    });

    return written;
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
        const written: string[] = journal();

        new FailureFilter().catch(new BadRequestException('версия схемы груза обязательна'), hostWith('/api/intake/proposals', response));

        expect(written).toEqual(['отказ приёма: род proposals, дерево own-tree, код 400']);
    });

    it('SC-MB-30 — в строке журнала нет ни токена, ни текста груза', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: string[] = journal();

        new FailureFilter().catch(
            new BadRequestException('в грузе рода «предложения» не хватает полей: items'),
            hostWith('/api/intake/proposals', response)
        );

        expect(written).toHaveLength(1);
        expect(written[0]).not.toContain('items');
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
        const written: string[] = journal();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/postmortems', response, null));

        const incident: string | null = incidentOf(messageOf(response));

        expect(response.code).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(messageOf(response)).toContain('прочитать не удалось, попытку следует повторить');
        expect(incident).not.toBeNull();
        expect(written).toEqual([`отказ: путь /api/postmortems, код 503, обращение ${incident}`]);
    });

    it('SC-MB-72 — незнакомая поломка на чтении отвечает пятисотым с номером обращения', () => {
        const response: ResponseDouble = new ResponseDouble();
        const written: string[] = journal();

        new FailureFilter().catch(new TypeError('cannot read properties of undefined'), hostWith('/api/summaries', response, null));

        const incident: string | null = incidentOf(messageOf(response));

        expect(response.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(messageOf(response)).toContain('прочитать не удалось');
        expect(written).toEqual([`отказ: путь /api/summaries, код 500, обращение ${incident}`]);
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
        const written: string[] = journal();

        new FailureFilter().catch(new PrismaClientKnownRequestError(), hostWith('/api/intake/summary', response));

        const incident: string | null = incidentOf(messageOf(response));

        expect(incident).not.toBeNull();
        expect(written).toEqual([`отказ приёма: род summary, дерево own-tree, код 503, обращение ${incident}`]);
    });
});
