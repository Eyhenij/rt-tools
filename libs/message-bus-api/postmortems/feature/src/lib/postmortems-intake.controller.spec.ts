import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { ECargoState, IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

import { PostmortemsIntakeController } from './postmortems-intake.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

/** Разбор, который называет файлы дерева: проверка на адрес его отбивать не должна. */
const TEXT_WITH_PATHS: string =
    'Промах: гейт правил звал на серверную сторону правило витрины.\n' +
    'Где: .claude/rt-kit/gate-map.sh, ветка `*/apps/message-bus/*`.\n' +
    'Почему: ветки общих суффиксов стояли раньше частных.';

interface IRecordRow {
    id: string;
    treeId: string;
    month: string;
    summary: TCargoBody | null;
    schema: string;
    ranAt: Date;
}

interface IPostmortemStored {
    treeId: string;
    file: string;
    text: string;
    state: ECargoState;
    closedByPublisher: boolean;
    updatedAt: Date;
}

/** Двойник хранилища: записи месяца и разборы, опознаваемые парой «дерево — имя файла». */
class PrismaDouble {
    public readonly records: IRecordRow[] = [];
    public readonly postmortems: IPostmortemStored[] = [];

    public get monthRecord(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#foundRecord(args) ?? null,
            upsert: async (args: Record<string, unknown>): Promise<{ id: string }> => this.#upsertRecord(args),
        };
    }

    public get postmortem(): {
        findMany: (args: Record<string, unknown>) => Promise<IPostmortemStored[]>;
        upsert: (args: Record<string, unknown>) => Promise<{ id: string }>;
    } {
        return {
            findMany: async (args: Record<string, unknown>): Promise<IPostmortemStored[]> => this.#foundPostmortems(args),
            upsert: async (args: Record<string, unknown>): Promise<{ id: string }> => this.#upsertPostmortem(args),
        };
    }

    /** Сделка двойника: команды приезжают уже собранными обещаниями и просто ждутся по очереди. */
    public async $transaction(operations: Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #foundRecord(args: Record<string, unknown>): IRecordRow | undefined {
        const key: { treeId: string; month: string } = (args['where'] as { treeId_month: { treeId: string; month: string } }).treeId_month;

        return this.records.find((row: IRecordRow): boolean => row.treeId === key.treeId && row.month === key.month);
    }

    #upsertRecord(args: Record<string, unknown>): { id: string } {
        const found: IRecordRow | undefined = this.#foundRecord(args);

        if (found) {
            Object.assign(found, args['update']);

            return { id: found.id };
        }

        const created: IRecordRow = {
            id: `record-${this.records.length + 1}`,
            summary: null,
            ...(args['create'] as Omit<IRecordRow, 'id'>),
        };
        this.records.push(created);

        return { id: created.id };
    }

    /** Разборы дерева по именам файлов: этим запросом приём берёт лежащие тексты до записи. */
    #foundPostmortems(args: Record<string, unknown>): IPostmortemStored[] {
        const where: { treeId: string; file: { in: string[] } } = args['where'] as { treeId: string; file: { in: string[] } };

        return this.postmortems.filter(
            (row: IPostmortemStored): boolean => row.treeId === where.treeId && where.file.in.includes(row.file)
        );
    }

    #upsertPostmortem(args: Record<string, unknown>): { id: string } {
        const key: { treeId: string; file: string } = (args['where'] as { treeId_file: { treeId: string; file: string } }).treeId_file;
        const found: IPostmortemStored | undefined = this.postmortems.find(
            (row: IPostmortemStored): boolean => row.treeId === key.treeId && row.file === key.file
        );

        if (found) {
            Object.assign(found, args['update'], { updatedAt: new Date('2026-08-15T00:00:00Z') });

            return { id: `${found.treeId}:${found.file}` };
        }

        // Состояние заведённой записи ставит умолчание колонки, а не приём: двойник повторяет его,
        // иначе приезд читался бы состоянием, которого у настоящей записи не бывает.
        const created: IPostmortemStored = {
            state: ECargoState.New,
            closedByPublisher: false,
            updatedAt: new Date('2026-08-14T00:00:00Z'),
            ...(args['create'] as Omit<IPostmortemStored, 'state' | 'closedByPublisher' | 'updatedAt'>),
        };
        this.postmortems.push(created);

        return { id: `${created.treeId}:${created.file}` };
    }
}

class ResponseDouble implements IIntakeResponse {
    public code: number = 0;

    public status(code: number): unknown {
        this.code = code;

        return this;
    }
}

function requestOf(): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};
    rememberTree(request, TREE);

    return request;
}

function cargo(items: TCargoBody[]): TCargoBody {
    return { schema: '1', tree: TREE.slug, items };
}

function controllerWith(prisma: PrismaDouble): PostmortemsIntakeController {
    return new PostmortemsIntakeController(prisma as unknown as PrismaService);
}

describe('PostmortemsIntakeController', () => {
    it('SC-MB-14 — разбор приезжает текстом целиком, и адреса дерева его не отбивают', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await controllerWith(prisma).accept(
            cargo([{ file: '2026-08-14-gate-map.md', text: TEXT_WITH_PATHS }]),
            requestOf(),
            new ResponseDouble()
        );

        expect(prisma.postmortems).toHaveLength(1);
        expect(prisma.postmortems[0].text).toBe(TEXT_WITH_PATHS);
    });

    it('SC-MB-15 — повторно приехавший разбор обновляет прежний, а не заводит второй', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: PostmortemsIntakeController = controllerWith(prisma);
        const file: string = '2026-08-14-gate-map.md';

        await controller.accept(cargo([{ file, text: 'первая редакция' }]), requestOf(), new ResponseDouble());
        const arrivedAt: Date = prisma.postmortems[0].updatedAt;
        await controller.accept(cargo([{ file, text: 'исправленный текст' }]), requestOf(), new ResponseDouble());

        expect(prisma.postmortems).toHaveLength(1);
        expect(prisma.postmortems[0].text).toBe('исправленный текст');
        expect(prisma.postmortems[0].updatedAt.getTime()).toBeGreaterThan(arrivedAt.getTime());
    });

    it('SC-MB-15 — разбор с другим именем файла ложится второй записью', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: PostmortemsIntakeController = controllerWith(prisma);

        await controller.accept(cargo([{ file: 'первый.md', text: 'раз' }]), requestOf(), new ResponseDouble());
        await controller.accept(cargo([{ file: 'второй.md', text: 'два' }]), requestOf(), new ResponseDouble());

        expect(prisma.postmortems.map((row: IPostmortemStored): string => row.file)).toEqual(['первый.md', 'второй.md']);
    });

    it('SC-MB-22 — разборы, приехавшие раньше сводки, заводят запись месяца', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await controllerWith(prisma).accept(cargo([{ file: 'разбор.md', text: 'текст' }]), requestOf(), new ResponseDouble());

        expect(prisma.records).toHaveLength(1);
        expect(prisma.records[0].summary).toBeNull();
    });

    it('SC-MB-169 — приезд с другим текстом возвращает взятый в работу разбор в «новое»', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: PostmortemsIntakeController = controllerWith(prisma);
        const file: string = '2026-08-14-gate-map.md';

        await controller.accept(cargo([{ file, text: 'первая редакция' }]), requestOf(), new ResponseDouble());
        prisma.postmortems[0].state = ECargoState.InWork;
        await controller.accept(cargo([{ file, text: 'исправленный текст' }]), requestOf(), new ResponseDouble());

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(prisma.postmortems[0].text).toBe('исправленный текст');
    });

    it('SC-MB-323 — приезд с другим текстом не возвращает в «новое» разбор, закрытый издателем', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: PostmortemsIntakeController = controllerWith(prisma);
        const file: string = '2026-08-14-gate-map.md';

        await controller.accept(cargo([{ file, text: 'первая редакция' }]), requestOf(), new ResponseDouble());
        prisma.postmortems[0].state = ECargoState.Fixed;
        prisma.postmortems[0].closedByPublisher = true;
        await controller.accept(cargo([{ file, text: 'текст с отметкой о починке' }]), requestOf(), new ResponseDouble());

        expect(prisma.postmortems[0].state).toBe(ECargoState.Fixed);
        expect(prisma.postmortems[0].text).toBe('текст с отметкой о починке');
    });

    it('SC-MB-170 — приезд с тем же текстом состояния не трогает', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: PostmortemsIntakeController = controllerWith(prisma);
        const file: string = '2026-08-14-gate-map.md';

        await controller.accept(cargo([{ file, text: TEXT_WITH_PATHS }]), requestOf(), new ResponseDouble());
        prisma.postmortems[0].state = ECargoState.InWork;
        await controller.accept(cargo([{ file, text: TEXT_WITH_PATHS }]), requestOf(), new ResponseDouble());

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
    });

    it('приехавший впервые разбор встаёт в «новое» умолчанием колонки', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await controllerWith(prisma).accept(cargo([{ file: 'разбор.md', text: 'текст' }]), requestOf(), new ResponseDouble());

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
    });

    it('SC-MB-13 — разбор без обязательного поля отбивает операцию целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await controllerWith(prisma)
            .accept(cargo([{ file: 'первый.md', text: 'раз' }, { file: 'второй.md' }]), requestOf(), new ResponseDouble())
            .catch((): void => undefined);

        expect(prisma.postmortems).toHaveLength(0);
        expect(prisma.records).toHaveLength(0);
    });
});
