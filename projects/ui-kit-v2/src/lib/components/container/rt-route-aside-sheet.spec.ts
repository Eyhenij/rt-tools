import { ApplicationRef, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router, UrlTree } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtAsideFooterComponent } from '../aside/footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../aside/header/rt-aside-header.component';
import { RtAsideContentDirective } from '../aside/rt-aside-content.directive';
import { RtAsideComponent } from '../aside/rt-aside.component';
import { ERtAsideUnsavedOutcome } from '../aside/unsaved-dialog/rt-aside-unsaved.logic';
import { DRAG_DISMISS_THRESHOLD_PX } from '../bottom-sheet/rt-bottom-sheet.logic';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { RtContainerComponent } from './rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerRightSidenavDirective,
    RtContainerRightSidenavPanelDirective,
} from './rt-container.directives';
import { RtRouteAsideComponent } from './rt-route-aside.base';

const PHONE_QUERY: string = '(max-width: 480px)';

/** Роутер без маршрутов: панель уходит с адреса, а спека считает уходы. */
class RouterStub {
    public navigations: number = 0;

    public navigate(): Promise<boolean> {
        this.navigations += 1;
        return Promise.resolve(true);
    }

    public navigateByUrl(): Promise<boolean> {
        return this.navigate();
    }

    public createUrlTree(): UrlTree {
        return {} as UrlTree;
    }

    public serializeUrl(): string {
        return '/';
    }
}

/** Окно о правках в центре: спека считает открытия. */
class DialogStub {
    public opens: number = 0;

    public open(): { afterClosed: () => Observable<ERtAsideUnsavedOutcome | undefined> } {
        this.opens += 1;
        return { afterClosed: (): Observable<ERtAsideUnsavedOutcome | undefined> => new Subject<ERtAsideUnsavedOutcome | undefined>() };
    }
}

/** Панель записи с гардом правок: тронутость и запись решает спека. */
@Component({
    selector: 'rt-record-sheet-panel',
    template: `
        <ng-container rtContainerRightSidenavPanel (cancelled)="onCancel()" (closed)="onClosed()" />
        <rt-aside>
            <rt-aside-header title="Запись 7" (dismiss)="onClose()" />
            <ng-template rtAsideContent><input qa-dataid="record-name" /></ng-template>
            <rt-aside-footer>
                <button rtButton asidePrimary qa-dataid="record-save" type="button" label="Сохранить" (click)="write()"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtContainerRightSidenavPanelDirective,
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideFooterComponent,
        RtAsideContentDirective,
        RtButtonDirective,
    ],
})
class RecordSheetPanelComponent extends RtRouteAsideComponent<{ id: string }> {
    readonly #writeSource: Subject<unknown> = new Subject<unknown>();

    public readonly pristineFlag: WritableSignal<boolean> = signal(true);
    public writes: number = 0;

    constructor() {
        super();
        this.guardUnsavedChanges({ pristine: this.pristineFlag.asReadonly(), save: (): void => this.write() });
    }

    public write(): void {
        this.writes += 1;
        this.runMutation(this.#writeSource.asObservable(), { closeOnSuccess: true });
    }

    /** Сервер ответил на запись. */
    public completeWrite(): void {
        this.#writeSource.next({});
        this.#writeSource.complete();
    }

    public override canDeactivate(): Observable<boolean> {
        return super.canDeactivate();
    }

    protected resolve(id: string): Observable<{ id: string } | null> {
        return of({ id });
    }
}

@Component({
    selector: 'rt-record-sheet-host',
    template: `
        <rt-container>
            <ng-template rtContainerContent><button type="button" qa-dataid="page-button">Список</button></ng-template>
            <ng-template rtContainerRightSidenav><rt-record-sheet-panel /></ng-template>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective, RecordSheetPanelComponent],
})
class RecordSheetHostComponent {}

type TFixture = ComponentFixture<RecordSheetHostComponent>;

let router: RouterStub;
let dialog: DialogStub;

async function settle(fixture: TFixture): Promise<void> {
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    fixture.detectChanges();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();
    await fixture.whenStable();
    fixture.detectChanges();
    app.tick();
}

function panel(fixture: TFixture): RecordSheetPanelComponent {
    return el(fixture, 'rt-record-sheet-panel')?.componentInstance as RecordSheetPanelComponent;
}

/** Панель записи открыта по адресу, форма тронута. */
async function openDirty(phone: boolean = true): Promise<TFixture> {
    setMediaQueryMatches(PHONE_QUERY, phone);
    router = new RouterStub();
    dialog = new DialogStub();
    const fixture: TFixture = createRtFixture(
        RecordSheetHostComponent,
        {},
        {
            providers: [
                { provide: Router, useValue: router },
                { provide: RtDialogService, useValue: dialog },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ id: '7' })),
                        snapshot: { routeConfig: { path: 'edit/:id', outlet: 'ro' } },
                        parent: null,
                    },
                },
            ],
        }
    );
    await settle(fixture);
    await settle(fixture);
    panel(fixture).pristineFlag.set(false);
    fixture.detectChanges();

    return fixture;
}

function container(fixture: TFixture): RtContainerComponent {
    return el(fixture, 'rt-container')?.componentInstance as RtContainerComponent;
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function swipe(distance: number = DRAG_DISMISS_THRESHOLD_PX + 1): void {
    node('bottom-sheet-handle')?.dispatchEvent(new MouseEvent('pointerdown', { clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientY: distance, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointerup', { clientY: distance, bubbles: true }));
}

function press(id: string): void {
    node(id)?.click();
}

describe('Панель записи на телефоне — вопрос о правках внизу экрана', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((overlays: Element): void => overlays.remove());
        resetMediaQueries();
    });

    it('SC-UKV-1820 — свайп тронутой панели сначала спрашивает внизу экрана, шторка остаётся под вопросом', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();

        swipe();
        await settle(fixture);

        expect(node('bottom-sheet-confirm')).not.toBeNull();
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(container(fixture).rightOpen()).toBe(true);
        expect(dialog.opens).toBe(0);
    });

    it('SC-UKV-1851 — ответы стоят листом действий: отказ красный, согласие с фокусом, «остаться» отдельной карточкой', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();

        node('aside-sheet-close')?.querySelector('button')?.click();
        await settle(fixture);
        const answers: string[] = Array.from(node('bottom-sheet-confirm')?.querySelectorAll('button') ?? []).map(
            (button: HTMLButtonElement): string => button.textContent?.trim() ?? ''
        );

        expect(node('bottom-sheet-confirm-title')?.textContent?.trim()).toBe('Unsaved changes');
        expect(answers).toEqual(['Close without saving', 'Save and close', 'Stay']);
        expect(document.activeElement).toBe(node('bottom-sheet-confirm-apply'));
        expect(node('bottom-sheet-confirm-discard')?.classList).toContain('rt-bottom-sheet__confirm-row--danger');
        expect(node('bottom-sheet-confirm-apply')?.closest('[qa-dataid="bottom-sheet-confirm-card"]')).not.toBeNull();
        expect(node('bottom-sheet-confirm-cancel')?.closest('[qa-dataid="bottom-sheet-confirm-stay-card"]')).not.toBeNull();
    });

    it('SC-UKV-1821 — «Сохранить и закрыть» пишет запись и закрывает панель после записи', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();
        swipe();
        await settle(fixture);

        press('bottom-sheet-confirm-apply');
        await settle(fixture);

        expect(panel(fixture).writes).toBe(1);
        expect(container(fixture).rightOpen()).toBe(true);

        panel(fixture).completeWrite();
        await settle(fixture);

        expect(container(fixture).rightOpen()).toBe(false);
        expect(router.navigations).toBe(1);
    });

    it('SC-UKV-1822 — «Закрыть без сохранения» закрывает панель, правки не пишутся', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();
        swipe();
        await settle(fixture);

        press('bottom-sheet-confirm-discard');
        await settle(fixture);

        expect(panel(fixture).writes).toBe(0);
        expect(container(fixture).rightOpen()).toBe(false);
    });

    it('SC-UKV-1823 — «Остаться» после свайпа оставляет форму и ставит фокус на шторку', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();
        (node('record-name') as HTMLInputElement).value = 'Новое имя';
        swipe();
        await settle(fixture);

        press('bottom-sheet-confirm-cancel');
        await settle(fixture);

        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(container(fixture).rightOpen()).toBe(true);
        expect((node('record-name') as HTMLInputElement).value).toBe('Новое имя');
        expect(node('aside-sheet')?.contains(document.activeElement)).toBe(true);
    });

    it('SC-UKV-1824 — от 481 точки вопрос о правках — окно в центре', async (): Promise<void> => {
        const fixture: TFixture = await openDirty(false);

        node('aside-back')?.querySelector('button')?.click();
        await settle(fixture);

        expect(dialog.opens).toBe(1);
        expect(node('bottom-sheet-confirm')).toBeNull();
    });

    it('SC-UKV-1825 — закрытие во время записи не спрашивает и шторку не закрывает', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();
        panel(fixture).write();
        await settle(fixture);

        swipe();
        await settle(fixture);

        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(container(fixture).rightOpen()).toBe(true);
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1849 — кнопка «назад» под тронутой панелью спрашивает внизу, адрес остаётся', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();
        const answers: boolean[] = [];

        // Кнопка «назад» браузера доходит до панели её гардом ухода.
        panel(fixture)
            .canDeactivate()
            .subscribe((leave: boolean): number => answers.push(leave));
        await settle(fixture);

        expect(node('bottom-sheet-confirm')).not.toBeNull();
        expect(answers).toEqual([]);

        press('bottom-sheet-confirm-cancel');
        await settle(fixture);

        expect(answers).toEqual([false]);
    });

    it('SC-UKV-1860 — вторая просьба закрыться при показанном вопросе не спрашивает заново', async (): Promise<void> => {
        const fixture: TFixture = await openDirty();
        swipe();
        await settle(fixture);

        swipe();
        container(fixture).backdropClick.emit();
        await settle(fixture);

        expect(document.querySelectorAll('[qa-dataid="bottom-sheet-confirm"]').length).toBe(1);
        expect(container(fixture).rightOpen()).toBe(true);
    });
});
