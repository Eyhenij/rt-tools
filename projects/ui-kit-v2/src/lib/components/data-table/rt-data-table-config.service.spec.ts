import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { IDBStorageService } from '@rt-tools/core';

import { RtDataTableConfigService } from './rt-data-table-config.service';
import { ERtDataTableColumnType, IRtDataTable } from './rt-data-table.model';

interface IEntity {
    id: string;
    title: string;
    status: string;
}

/**
 * Двойник хранилища: чтение отдаёт поток, которым правит сама спека, — иначе выбор исхода при
 * двух чтениях подряд не увидеть, оба ответа приходят разом.
 */
class StorageStub {
    /** Потоки чтения по порядку вызовов: спека отвечает на них тем и в том порядке, каким хочет. */
    public readonly reads: Array<Subject<unknown>> = [];
    /** След записей и снятий в порядке, в котором они дошли до хранилища. */
    public readonly writes: Array<string> = [];
    /** Ключи, по которым служба читала, — по одному на каждый поток в `reads`. */
    public readonly readKeys: Array<string> = [];
    /** Что именно легло в хранилище: без этого путь «сохранили — открыли снова» не проверить. */
    public readonly stored: Map<string, unknown> = new Map<string, unknown>();

    readonly #sets: Array<Subject<void>> = [];

    public get(key: string): Observable<unknown> {
        const read: Subject<unknown> = new Subject<unknown>();
        this.reads.push(read);
        this.readKeys.push(key);

        return read.asObservable();
    }

    /** Запись отвечает не сразу: снятие, пущенное следом, обгоняло бы её при двух потоках. */
    public set(key: string, value?: unknown): Observable<void> {
        const write: Subject<void> = new Subject<void>();
        this.#sets.push(write);

        return new Observable<void>((subscriber: { next: (value: void) => void; complete: () => void }) => {
            this.writes.push(`set:${key}`);
            this.stored.set(key, value);
            write.subscribe({ next: (): void => subscriber.next(), complete: (): void => subscriber.complete() });
        });
    }

    public remove(key: string): Observable<void> {
        return new Observable<void>((subscriber: { complete: () => void }) => {
            this.writes.push(`remove:${key}`);
            subscriber.complete();
        });
    }

    /** Ответить на запись, которая ждёт: ею спека задаёт порядок ответов хранилища. */
    public completeSet(index: number): void {
        this.#sets[index]?.complete();
    }
}

function columnOf(propName: keyof IEntity, label: string): IRtDataTable.Column<IEntity> {
    return {
        align: 'left',
        propName,
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        header: { align: 'left', label },
    };
}

function propNames(config: IRtDataTable.Config.Data<IEntity>): Array<keyof IEntity> {
    return config.columns.map((column: IRtDataTable.Column<IEntity>) => column.propName);
}

describe('RtDataTableConfigService', () => {
    let storage: StorageStub;
    let service: RtDataTableConfigService<IEntity>;

    beforeEach(() => {
        storage = new StorageStub();

        TestBed.configureTestingModule({
            providers: [{ provide: IDBStorageService, useValue: storage }, RtDataTableConfigService],
        });

        service = TestBed.inject(RtDataTableConfigService<IEntity>);
    });

    it('SC-UKV-272 — сохранённое под другой состав колонок отбрасывается, колонки идут объявленные', () => {
        service.initConfig('orders', [columnOf('id', 'Номер'), columnOf('title', 'Название'), columnOf('status', 'Статус')]);

        storage.reads[0].next({
            isVerticalScrollbarShown: true,
            isHorizontalScrollbarShown: false,
            columns: [
                { propName: 'title', orderIndex: 0, hidden: false },
                { propName: 'id', orderIndex: 1, hidden: true },
            ],
        });

        expect(propNames(service.tableConfig())).toEqual(['id', 'title', 'status']);
        expect(service.tableConfig().columns.some((column: IRtDataTable.Column<IEntity>) => column.hidden)).toBe(false);
        expect(service.tableConfig().isHorizontalScrollbarShown).toBe(true);
        expect(service.tableConfig().isVerticalScrollbarShown).toBe(false);
    });

    it('SC-UKV-317 — настройки, сохранённые первым китом под тем же ключом, читаются как есть', () => {
        service.initConfig('orders', [columnOf('id', 'Номер'), columnOf('title', 'Название')]);

        expect(storage.readKeys).toEqual(['orders']);

        // Запись первого кита: частичные колонки с порядком, видимостью и шириной.
        storage.reads[0].next({
            isVerticalScrollbarShown: true,
            isHorizontalScrollbarShown: false,
            columns: [
                { displayName: 'Название', propName: 'title', width: 'auto', orderIndex: 0, hidden: true, fixed: false },
                { displayName: 'Номер', propName: 'id', width: '120px', orderIndex: 1, hidden: false, fixed: false },
            ],
        });

        const config: IRtDataTable.Config.Data<IEntity> = service.tableConfig();

        expect(propNames(config)).toEqual(['title', 'id']);
        expect(config.columns[0].hidden).toBe(true);
        expect(config.columns[1].width).toBe('120px');
        expect(config.columns[1].type).toBe(ERtDataTableColumnType.TEXT);
        expect(config.isVerticalScrollbarShown).toBe(true);
        expect(config.isHorizontalScrollbarShown).toBe(false);
    });

    it('запись уходит в форме первого кита', () => {
        service.updateConfig('orders', {
            isVerticalScrollbarShown: false,
            isHorizontalScrollbarShown: true,
            columns: [{ ...columnOf('id', 'Номер'), orderIndex: 3, hidden: true }],
        });

        expect(storage.writes).toEqual(['set:orders']);
    });

    it('оставляет настройку последнего чтения, когда первое ответило позже второго', () => {
        service.initConfig('orders', [columnOf('id', 'Первый состав')]);
        service.initConfig('orders', [columnOf('title', 'Второй состав')]);

        expect(storage.reads).toHaveLength(2);

        storage.reads[1].next(undefined);
        storage.reads[0].next(undefined);

        expect(propNames(service.tableConfig())).toEqual(['title']);
    });

    it('не пускает снятие вперёд записи, которая ещё не ответила', () => {
        service.updateConfig('orders', {
            isVerticalScrollbarShown: false,
            isHorizontalScrollbarShown: true,
            columns: [columnOf('id', 'Состав')],
        });
        service.deleteConfig('orders');

        expect(storage.writes).toEqual(['set:orders']);

        storage.completeSet(0);

        expect(storage.writes).toEqual(['set:orders', 'remove:orders']);
    });

    it('SC-UKV-269 — под ключом без сохранённого видна только горизонтальная полоса', () => {
        service.initConfig('orders', [columnOf('id', 'Номер'), columnOf('title', 'Название')]);

        storage.reads[0].next(undefined);

        expect(service.tableConfig().isHorizontalScrollbarShown).toBe(true);
        expect(service.tableConfig().isVerticalScrollbarShown).toBe(false);
    });

    it('SC-UKV-271 — сохранённое возвращается при следующем открытии таблицы', () => {
        const columns: Array<IRtDataTable.Column<IEntity>> = [columnOf('id', 'Номер'), columnOf('title', 'Название')];

        service.initConfig('orders', columns);
        storage.reads[0].next(undefined);

        // Человек спрятал колонку, переставил порядок и показал вертикальную полосу.
        service.updateConfig('orders', {
            isVerticalScrollbarShown: true,
            isHorizontalScrollbarShown: true,
            columns: [
                { ...columnOf('title', 'Название'), orderIndex: 0, hidden: false },
                { ...columnOf('id', 'Номер'), orderIndex: 1, hidden: true },
            ],
        });

        // Открыли снова тем же ключом — и хранилище отвечает ровно тем, что туда легло.
        service.initConfig('orders', columns);
        storage.reads[1].next(storage.stored.get('orders'));

        const config: IRtDataTable.Config.Data<IEntity> = service.tableConfig();

        expect(propNames(config)).toEqual(['title', 'id']);
        expect(config.columns[1].hidden).toBe(true);
        expect(config.isVerticalScrollbarShown).toBe(true);
    });
});
