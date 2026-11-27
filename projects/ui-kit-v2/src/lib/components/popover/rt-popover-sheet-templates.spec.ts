import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtSelectComponent } from '../select/rt-select.component';
import { IRtSelect } from '../select/rt-select.model';
import { rtPreloadPopoverSheet } from './rt-popover-sheet.helper';
import { RtPopoverDirective } from './rt-popover.directive';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
];

/** Панель со своими шапкой и подвалом шторки и поле выбора с теми же шаблонами на своих входах. */
@Component({
    selector: 'rt-popover-sheet-templates-host',
    template: `
        <button
            type="button"
            qa-dataid="own-trigger"
            rtPopoverSheet
            rtPopoverSheetTitle="Выбор"
            [rtPopover]="panelTpl"
            [rtPopoverSheetHeader]="headerTpl"
            [rtPopoverSheetFooter]="footerTpl"
            (rtPopoverSheetApply)="applied = applied + 1">
            Открыть
        </button>
        <rt-select [options]="options" [sheetHeaderTemplate]="headerTpl" [sheetFooterTemplate]="footerTpl" />
        <ng-template #panelTpl><p qa-dataid="own-panel">Панель</p></ng-template>
        <ng-template #headerTpl let-close let-apply="apply">
            <button type="button" qa-dataid="own-header-close" (click)="close()">Назад</button>
            <button type="button" qa-dataid="own-header-apply" (click)="apply()">Применить</button>
        </ng-template>
        <ng-template #footerTpl><span qa-dataid="own-footer">Подвал</span></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverDirective, RtSelectComponent],
})
class TemplatesHostComponent {
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
    public applied: number = 0;
}

type TFixture = ComponentFixture<TemplatesHostComponent>;

function setup(): TFixture {
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub() }];

    return createRtFixture(TemplatesHostComponent, {}, { providers });
}

function settle(fixture: TFixture): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function press(fixture: TFixture, anchor: string): void {
    ((fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${anchor}"]`) as HTMLElement).click();
    settle(fixture);
}

function inSheet(anchor: string): HTMLElement | null {
    return document.querySelector(`.rt-popover-sheet [qa-dataid="${anchor}"]`);
}

describe('Нижняя шторка поповера — свои шаблоны шапки и подвала', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadPopoverSheet();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1753 — шаблоны панели встают в шапку и подвал её шторки', (): void => {
        const fixture: TFixture = setup();

        press(fixture, 'own-trigger');

        expect(inSheet('own-panel')).not.toBeNull();
        expect(inSheet('own-header-close')?.closest('[qa-dataid="bottom-sheet-header"]')).not.toBeNull();
        expect(inSheet('own-footer')?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
        expect(inSheet('bottom-sheet-close')).toBeNull();
        expect(inSheet('popover-sheet-title')).toBeNull();
    });

    it('SC-UKV-1753 — просьба закрыть из своей шапки закрывает панель', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'own-trigger');

        (inSheet('own-header-close') as HTMLElement).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet .rt-bottom-sheet--open')).toBeNull();
    });

    it('SC-UKV-1766 — своя шапка получает просьбу применить: она уходит наружу тем же событием, что ответ «Применить»', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'own-trigger');

        (inSheet('own-header-apply') as HTMLElement).click();
        settle(fixture);

        expect(fixture.componentInstance.applied).toBe(1);
        expect(document.querySelector('.rt-popover-sheet .rt-bottom-sheet--open')).not.toBeNull();
    });

    it('SC-UKV-1766 — шторка со своей шапкой названа строкой заголовка: узла заголовка в разметке нет', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'own-trigger');
        const dialog: HTMLElement = inSheet('bottom-sheet-panel') as HTMLElement;

        expect(dialog.getAttribute('aria-label')).toBe('Выбор');
        expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('SC-UKV-1754 — поле выбора отдаёт шторке шаблоны своих входов sheetHeaderTemplate и sheetFooterTemplate', (): void => {
        const fixture: TFixture = setup();

        press(fixture, 'select-trigger');

        expect(document.querySelectorAll('.rt-popover-sheet [qa-dataid="select-option"]').length).toBe(2);
        expect(inSheet('own-header-close')?.closest('[qa-dataid="bottom-sheet-header"]')).not.toBeNull();
        expect(inSheet('own-footer')?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
    });
});
