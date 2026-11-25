import { InteractivityChecker } from '@angular/cdk/a11y';
import { ApplicationRef, ChangeDetectionStrategy, Component, getDebugNode, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BreakpointsService } from '../../platform';
import { DRAG_DISMISS_THRESHOLD_PX } from '../bottom-sheet/rt-bottom-sheet.logic';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtRadioButtonComponent } from '../radio-button/rt-radio-button.component';
import { RtRadioGroupComponent } from '../radio-button/rt-radio-group.component';
import { RtSelectComponent } from '../select/rt-select.component';
import { IRtSelect } from '../select/rt-select.model';
import { RtToolbarComponent, RtToolbarFiltersDirective } from './rt-toolbar.component';

/** Способы оплаты — варианты выпадающего списка кита в отборах. */
const PAYMENTS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'card', label: 'Карта' },
    { value: 'cash', label: 'Наличные' },
];

/** Телефон: место узкое, окно 375 точек. */
class PhoneBreakpointsService {
    public readonly narrow: Signal<boolean> = signal(true);
    public readonly phone: Signal<boolean> = signal(true);
    public readonly viewportNarrow: Signal<boolean> = this.narrow;
    public readonly belowNarrow: Signal<boolean> = this.narrow;
    public readonly mobile: Signal<boolean> = this.phone;
    public readonly tablet: Signal<boolean> = signal(false);
    public readonly desktop: Signal<boolean> = signal(false);

    public registerPlace(): void {
        return;
    }
}

@Component({
    selector: 'rt-toolbar-filters-sheet-host',
    template: `
        <rt-toolbar
            (filtersApply)="applied.set(applied() + 1)"
            (filtersReset)="resets.set(resets() + 1)"
            (filtersDiscard)="discards.set(discards() + 1)">
            <ng-template rtToolbarFilters let-place>
                <input qa-dataid="slot-filter" [attr.data-place]="place" />
                <rt-select qa-dataid="slot-payment" placeholder="Любая" [options]="payments" [formControl]="payment" />
                <rt-radio-group ariaLabel="Счета">
                    <rt-radio-button qa-dataid="slot-all" value="all" label="Все" [formControl]="kind" />
                    <rt-radio-button qa-dataid="slot-paid" value="paid" label="Оплаченные" [formControl]="kind" />
                </rt-radio-group>
            </ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtToolbarComponent,
        RtToolbarFiltersDirective,
        RtSelectComponent,
        RtRadioGroupComponent,
        RtRadioButtonComponent,
        ReactiveFormsModule,
    ],
})
class ToolbarFiltersSheetHostComponent {
    protected readonly payments: ReadonlyArray<IRtSelect.Option<string>> = PAYMENTS;
    public readonly payment: FormControl<string | null> = new FormControl<string | null>(null);
    public readonly kind: FormControl<string> = new FormControl<string>('all', { nonNullable: true });
    public readonly applied: WritableSignal<number> = signal(0);
    public readonly resets: WritableSignal<number> = signal(0);
    public readonly discards: WritableSignal<number> = signal(0);
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

async function settle(): Promise<void> {
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    app.tick();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();
    await app.whenStable();
    app.tick();
}

/** Вводит значение в поле отбора так, как его вводит человек: событием `input`. */
function type(value: string): void {
    const field: HTMLInputElement | null = document.querySelector<HTMLInputElement>('[qa-dataid="slot-filter"]');
    if (field !== null) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

/** Зовёт обработчик списка кита — тот, что зовут нажатие по варианту и крестик. */
function callSelect(method: 'select' | 'clear', ...args: unknown[]): void {
    const select: RtSelectComponent<string> = getDebugNode(node('slot-payment'))?.componentInstance as RtSelectComponent<string>;
    (Reflect.get(select, method) as (...rest: unknown[]) => void).apply(select, args);
}

/** Выбирает способ оплаты в списке кита так, как выбирает человек: нажатием по варианту. */
function pick(value: string): void {
    callSelect(
        'select',
        PAYMENTS.find((it: IRtSelect.Option<string>): boolean => it.value === value)
    );
}

function pressClose(): void {
    node('aside-sheet-close')?.querySelector('button')?.click();
}

/** Шторка отборов поднята. */
function sheetUp(): boolean {
    return node('aside-sheet')?.classList.contains('rt-bottom-sheet--open') === true;
}

async function openFilters(): Promise<ComponentFixture<ToolbarFiltersSheetHostComponent>> {
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            { provide: BreakpointsService, useClass: PhoneBreakpointsService },
            // jsdom не раскладывает страницу, и ловушка фокуса без подмены не видит ни одного поля
            {
                provide: InteractivityChecker,
                useValue: {
                    isDisabled: (): boolean => false,
                    isVisible: (): boolean => true,
                    isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
                    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
                },
            },
        ],
    });
    const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = TestBed.createComponent(ToolbarFiltersSheetHostComponent);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[qa-dataid="toolbar-filters-trigger"] button')?.click();
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    app.tick();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();

    return fixture;
}

describe('Отборы полосы на телефоне — шторка', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
    });

    it('SC-UKV-1806 — отборы поднимаются шторкой: «Применить» справа в шапке, «Сбросить» в подвале', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();

        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('bottom-sheet-panel')?.classList).toContain('rt-bottom-sheet__panel--full');
        expect(node('toolbar-filters-apply')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
        expect(node('toolbar-filters-reset')?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
        expect(node('slot-filter')?.getAttribute('data-place')).toBe('panel');

        node('toolbar-filters-apply')?.click();

        expect(fixture.componentInstance.applied()).toBe(1);
    });

    it('SC-UKV-1843 — «×» шторки с введённым и не применённым отбором спрашивает внизу', async (): Promise<void> => {
        await openFilters();
        await settle();
        type('Москва');

        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm-title')?.textContent?.trim()).toBe('Apply the changes?');
        expect(sheetUp()).toBe(true);
    });

    it('SC-UKV-1843 — «×» шторки с выбранным в списке кита и не применённым отбором спрашивает внизу', async (): Promise<void> => {
        await openFilters();
        await settle();
        pick('cash');
        await settle();

        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm-title')?.textContent?.trim()).toBe('Apply the changes?');
        expect(sheetUp()).toBe(true);
    });

    it('SC-UKV-1852 — выбор в списке кита, возвращённый назад, изменением не считается', async (): Promise<void> => {
        await openFilters();
        await settle();
        pick('cash');
        pick('card');
        await settle();
        // Список открывался с пустым значением: «Карта» — тоже правка, а вернуть пустое можно только крестиком.
        callSelect('clear');
        await settle();

        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1844 — «Не применять» сообщает об отказе и закрывает шторку без `filtersApply`', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();
        await settle();
        type('Москва');
        pressClose();
        await settle();

        node('bottom-sheet-confirm-discard')?.click();
        await settle();

        expect(fixture.componentInstance.discards()).toBe(1);
        expect(fixture.componentInstance.applied()).toBe(0);
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1844 — «Применить» вопроса применяет отборы и закрывает шторку', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();
        await settle();
        type('Москва');
        pressClose();
        await settle();

        node('bottom-sheet-confirm-apply')?.click();
        await settle();

        expect(fixture.componentInstance.applied()).toBe(1);
        expect(fixture.componentInstance.discards()).toBe(0);
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1845 — нетронутые отборы закрываются свайпом сразу, без вопроса', async (): Promise<void> => {
        await openFilters();
        await settle();
        node('bottom-sheet-handle')?.dispatchEvent(new MouseEvent('pointerdown', { clientY: 0, bubbles: true }));
        document.dispatchEvent(new MouseEvent('pointermove', { clientY: DRAG_DISMISS_THRESHOLD_PX + 1, bubbles: true }));
        document.dispatchEvent(new MouseEvent('pointerup', { clientY: DRAG_DISMISS_THRESHOLD_PX + 1, bubbles: true }));
        await settle();

        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1852 — отбор, введённый и возвращённый назад, изменением не считается', async (): Promise<void> => {
        await openFilters();
        await settle();
        type('Москва');
        type('');

        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1852 — радиокнопка, выбранная и возвращённая назад, изменением не считается', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();
        await settle();
        node('slot-paid')?.querySelector<HTMLElement>('[role="radio"]')?.click();
        await settle();
        node('slot-all')?.querySelector<HTMLElement>('[role="radio"]')?.click();
        await settle();

        pressClose();
        await settle();

        expect(fixture.componentInstance.kind.value).toBe('all');
        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1852 — радиокнопка, выбранная без возврата, — изменение, и шторка спрашивает', async (): Promise<void> => {
        await openFilters();
        await settle();
        node('slot-paid')?.querySelector<HTMLElement>('[role="radio"]')?.click();
        await settle();

        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm-title')?.textContent?.trim()).toBe('Apply the changes?');
    });

    it('SC-UKV-1870 — сброс кодом к значению при открытии снимает признак: шторка закрывается без вопроса', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();
        await settle();
        pick('cash');
        await settle();

        fixture.componentInstance.payment.setValue(null);
        await settle();
        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm')).toBeNull();
        expect(sheetUp()).toBe(false);
    });

    it('SC-UKV-1870 — значение, записанное кодом не как при открытии, — изменение, и шторка спрашивает', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();
        await settle();

        fixture.componentInstance.payment.setValue('card');
        await settle();
        pressClose();
        await settle();

        expect(node('bottom-sheet-confirm-title')?.textContent?.trim()).toBe('Apply the changes?');
    });
});
