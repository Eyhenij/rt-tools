import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { IDBStorageService } from '@rt-tools/core';
import { ETableColumnTypes, ITable } from './table-column.interface';
import { RtTableConfigService } from './table-config.service';

interface IEntity {
    id: string;
    title: string;
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

    readonly #sets: Array<Subject<void>> = [];

    public get(key: string): Observable<unknown> {
        const read: Subject<unknown> = new Subject<unknown>();
        this.reads.push(read);
        this.readKeys.push(key);

        return read.asObservable();
    }

    /** Запись отвечает не сразу: снятие, пущенное следом, обгоняло бы её при двух потоках. */
    public set(key: string): Observable<void> {
        const write: Subject<void> = new Subject<void>();
        this.#sets.push(write);

        return new Observable<void>((subscriber: { next: (value: void) => void; complete: () => void }) => {
            this.writes.push(`set:${key}`);
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

function columnOf(propName: keyof IEntity, label: string): ITable.Column<IEntity> {
    return {
        align: 'left',
        propName,
        type: ETableColumnTypes.TEXT,
        copyable: false,
        header: { label },
    } as ITable.Column<IEntity>;
}

describe('RtTableConfigService', () => {
    let storage: StorageStub;
    let service: RtTableConfigService<IEntity>;

    beforeEach(() => {
        storage = new StorageStub();

        TestBed.configureTestingModule({
            providers: [{ provide: IDBStorageService, useValue: storage }, RtTableConfigService],
        });

        service = TestBed.inject(RtTableConfigService<IEntity>);
    });

    /** SC-UK-15 — настройку показывает последнее чтение, а не ответивший последним */
    it('оставляет настройку последнего чтения, когда первое ответило позже второго', () => {
        service.initConfig('table', [columnOf('id', 'Первый состав')]);
        service.initConfig('table', [columnOf('title', 'Второй состав')]);

        expect(storage.reads).toHaveLength(2);

        storage.reads[1].next(undefined);
        storage.reads[0].next(undefined);

        expect(service.tableConfig().columns.map((column: ITable.Column<IEntity>) => column.propName)).toEqual(['title']);
    });

    /** SC-UK-16 — запись и снятие доходят до хранилища в порядке вызовов */
    it('не пускает снятие вперёд записи, которая ещё не ответила', () => {
        service.updateConfig('table', {
            isVerticalScrollbarShown: false,
            isHorizontalScrollbarShown: true,
            columns: [columnOf('id', 'Состав')],
        });
        service.deleteConfig('table');

        expect(storage.writes).toEqual(['set:table']);

        storage.completeSet(0);

        expect(storage.writes).toEqual(['set:table', 'remove:table']);
    });
});
