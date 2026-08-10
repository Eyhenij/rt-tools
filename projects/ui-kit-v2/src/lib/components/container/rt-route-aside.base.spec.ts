import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Params, Router, UrlTree } from '@angular/router';

import { firstValueFrom, Observable, of, Subject } from 'rxjs';

import { NotificationBus } from '../../platform';

import { ERtAsideUnsavedOutcome } from '../aside/unsaved-dialog/rt-aside-unsaved.logic';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { RtRouteAsideComponent } from './rt-route-aside.base';

interface ITestEntity {
    id: string;
}

/**
 * Роутер, чью навигацию спека доигрывает сама: разрешение на уход выдаётся перед
 * вызовом роутера и съедается вопросом о правках, поэтому спеке нужен и момент
 * «навигация пошла», и момент «навигация кончилась тем-то».
 */
class RouterStub {
    public navigations: number = 0;

    #settle: ((ok: boolean) => void) | null = null;

    public navigate(): Promise<boolean> {
        return this.#start();
    }

    public navigateByUrl(): Promise<boolean> {
        return this.#start();
    }

    public createUrlTree(): UrlTree {
        return {} as UrlTree;
    }

    public serializeUrl(): string {
        return '/related';
    }

    /** Навигация доехала или была отклонена — то и другое решает спека. */
    public settle(ok: boolean): void {
        this.#settle?.(ok);
        this.#settle = null;
    }

    #start(): Promise<boolean> {
        this.navigations += 1;

        return new Promise<boolean>((resolve: (ok: boolean) => void): void => {
            this.#settle = resolve;
        });
    }
}

/** Окно о правках: спека считает открытия и отвечает за пользователя. */
class DialogStub {
    public opens: number = 0;

    readonly #outcomeSource: Subject<ERtAsideUnsavedOutcome | undefined> = new Subject<ERtAsideUnsavedOutcome | undefined>();

    public open(): { afterClosed: () => Observable<ERtAsideUnsavedOutcome | undefined> } {
        this.opens += 1;

        return { afterClosed: (): Observable<ERtAsideUnsavedOutcome | undefined> => this.#outcomeSource.asObservable() };
    }

    public answer(outcome: ERtAsideUnsavedOutcome | undefined): void {
        this.#outcomeSource.next(outcome);
        this.#outcomeSource.complete();
    }
}

class NotificationBusStub {
    public successes: string[] = [];

    public success(message: string): void {
        this.successes.push(message);
    }
}

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestAsideComponent extends RtRouteAsideComponent<ITestEntity> {
    public readonly pristineFlag: WritableSignal<boolean> = signal(true);
    public saves: number = 0;

    /** Запись, которую спека доигрывает сама: исход решает, уйдёт панель или нет. */
    readonly #saveSource: Subject<unknown> = new Subject<unknown>();

    /**
     * Ставит гард правок так же, как это делает панель приложения: исход «закрыть
     * с сохранением» запускает настоящую запись — без неё панель считает, что
     * запись не началась, и снимает намерение уйти.
     */
    public guardForm(): void {
        this.guardUnsavedChanges({
            pristine: this.pristineFlag.asReadonly(),
            save: (): void => {
                this.saves += 1;
                this.runMutation(this.#saveSource.asObservable(), {});
            },
        });
    }

    /** Сервер ответил на запись, запущенную гардом правок. */
    public completeSave(): void {
        this.#saveSource.next({});
        this.#saveSource.complete();
    }

    /** Контейнер увёз панель и сообщил об этом — панель уходит с адреса. */
    public reportClosed(): void {
        this.onClosed();
    }

    public goRelated(commands: readonly unknown[], queryParams: Params | null = null): void {
        this.openRelated(commands, queryParams);
    }

    public save(op$: Observable<unknown>, opts?: Parameters<TestAsideComponent['runMutation']>[1]): void {
        this.runMutation(op$, opts);
    }

    protected resolve(id: string): Observable<ITestEntity | null> {
        return of({ id });
    }
}

describe('RtRouteAsideComponent', () => {
    let router: RouterStub;
    let dialog: DialogStub;

    function setup(): ComponentFixture<TestAsideComponent> {
        router = new RouterStub();
        dialog = new DialogStub();

        TestBed.configureTestingModule({
            imports: [TestAsideComponent],
            providers: [
                { provide: Router, useValue: router },
                { provide: RtDialogService, useValue: dialog },
                { provide: NotificationBus, useValue: new NotificationBusStub() },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ id: 'e1' })),
                        snapshot: { routeConfig: { path: 'edit/:id', outlet: 'ro' } },
                        parent: null,
                    },
                },
            ],
        });

        const fixture: ComponentFixture<TestAsideComponent> = TestBed.createComponent(TestAsideComponent);

        fixture.detectChanges();

        return fixture;
    }

    /** Панель с гардом и тронутой формой — состояние, в котором дефекты и жили. */
    function dirtyPanel(): ComponentFixture<TestAsideComponent> {
        const fixture: ComponentFixture<TestAsideComponent> = setup();

        fixture.componentInstance.guardForm();
        fixture.componentInstance.pristineFlag.set(false);

        return fixture;
    }

    it('SC-UKV-21 — удачная запись с закрытием не спрашивает о правках', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();

        fixture.componentInstance.save(of({}), { closeOnSuccess: true });
        // Контейнер увёз панель и сообщил об этом: дальше панель уходит с адреса.
        fixture.componentInstance.reportClosed();

        expect(router.navigations).toBe(1);
        await expect(firstValueFrom(fixture.componentInstance.canDeactivate())).resolves.toBe(true);
        expect(dialog.opens).toBe(0);
    });

    it('SC-UKV-22 — разрешение действует ровно на один уход', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();

        fixture.componentInstance.reportClosed();
        await expect(firstValueFrom(fixture.componentInstance.canDeactivate())).resolves.toBe(true);

        // Второй уход панель не начинала: о правках спрашивают.
        void fixture.componentInstance.canDeactivate().subscribe();

        expect(dialog.opens).toBe(1);
    });

    it('SC-UKV-23 — уход на связанную запись после согласия сохранить не спрашивает второй раз', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();

        fixture.componentInstance.goRelated(['/bookings', 'b2']);
        expect(dialog.opens).toBe(1);

        dialog.answer(ERtAsideUnsavedOutcome.Save);
        expect(fixture.componentInstance.saves).toBe(1);

        // Сервер ответил удачей — панель уходит туда, куда нажали.
        fixture.componentInstance.completeSave();

        expect(router.navigations).toBe(1);
        await expect(firstValueFrom(fixture.componentInstance.canDeactivate())).resolves.toBe(true);
        expect(dialog.opens).toBe(1);
    });

    it('SC-UKV-25 — навигация, которую роутер отклонил, разрешения не оставляет', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();

        fixture.componentInstance.reportClosed();
        // Роутер отклонил навигацию молча: маршрута под неё не нашлось. Снятие
        // разрешения идёт через цепочку обещаний — спека ждёт её конца.
        router.settle(false);
        await new Promise((resolve: (value: void) => void): void => {
            setTimeout(resolve, 0);
        });

        void fixture.componentInstance.canDeactivate().subscribe();

        expect(dialog.opens).toBe(1);
    });

    it('SC-UKV-29 — уход со стороны спрашивает о правках', () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();

        void fixture.componentInstance.canDeactivate().subscribe();

        expect(dialog.opens).toBe(1);
    });

    it('SC-UKV-32 — повторный уход при открытом окне второго окна не открывает', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();
        const answers: boolean[] = [];

        fixture.componentInstance.canDeactivate().subscribe((allowed: boolean): void => {
            answers.push(allowed);
        });
        fixture.componentInstance.canDeactivate().subscribe((allowed: boolean): void => {
            answers.push(allowed);
        });

        expect(dialog.opens).toBe(1);

        dialog.answer(ERtAsideUnsavedOutcome.Discard);

        expect(answers).toEqual([true, true]);
    });

    it('SC-UKV-33 — уход во время записи отменяется молча', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = dirtyPanel();

        // Запись ушла на сервер и ещё не вернулась; панель уже выдала себе
        // разрешение на уход — признак записи старше него.
        fixture.componentInstance.reportClosed();
        fixture.componentInstance.save(new Subject<unknown>().asObservable(), {});

        await expect(firstValueFrom(fixture.componentInstance.canDeactivate())).resolves.toBe(false);
        expect(dialog.opens).toBe(0);
    });

    it('SC-UKV-34 — уход со стороны при чистой форме проходит без окна', async () => {
        const fixture: ComponentFixture<TestAsideComponent> = setup();

        fixture.componentInstance.guardForm();

        await expect(firstValueFrom(fixture.componentInstance.canDeactivate())).resolves.toBe(true);
        expect(dialog.opens).toBe(0);
    });
});
