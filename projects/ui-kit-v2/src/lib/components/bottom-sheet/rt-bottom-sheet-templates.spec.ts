import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';
import { RtSheetFooterDirective } from './rt-sheet-footer.directive';
import { RtSheetHeaderDirective } from './rt-sheet-header.directive';

/** Шторка со своими шаблонами шапки и подвала: каждый включается своим переключателем. */
@Component({
    selector: 'rt-bottom-sheet-templates-host',
    template: `
        <rt-bottom-sheet [open]="true" [unsaved]="unsaved()" (openChange)="changes.push($event)">
            <h2 sheetHeader>Фильтры</h2>
            <button sheetFooter type="button" qa-dataid="slot-footer">Из слота</button>
            <p>Содержимое листа</p>
            @if (ownHeader()) {
                <ng-template rtSheetHeader let-close>
                    <button type="button" qa-dataid="own-back" (click)="close()">Назад</button>
                    <h2 qa-dataid="own-title">Свои отборы</h2>
                </ng-template>
            }
            @if (ownFooter()) {
                <ng-template rtSheetFooter let-close="close">
                    <button type="button" qa-dataid="own-show" (click)="close()">Показать</button>
                </ng-template>
            }
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetHeaderDirective, RtSheetFooterDirective],
})
class BottomSheetTemplatesHostComponent {
    public readonly ownHeader: WritableSignal<boolean> = signal<boolean>(false);
    public readonly ownFooter: WritableSignal<boolean> = signal<boolean>(false);
    public readonly unsaved: WritableSignal<boolean> = signal<boolean>(false);
    public readonly changes: boolean[] = [];
}

type TFixture = ComponentFixture<BottomSheetTemplatesHostComponent>;

function setup(parts: { header?: boolean; footer?: boolean; unsaved?: boolean }): TFixture {
    const fixture: TFixture = createRtFixture(BottomSheetTemplatesHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.ownHeader.set(parts.header ?? false);
    fixture.componentInstance.ownFooter.set(parts.footer ?? false);
    fixture.componentInstance.unsaved.set(parts.unsaved ?? false);
    fixture.detectChanges();

    return fixture;
}

function press(fixture: TFixture, id: string): void {
    (qa(fixture, id)?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

describe('RtBottomSheetComponent — свои шаблоны шапки и подвала', (): void => {
    it('SC-UKV-1750 — без своих шаблонов шторка рисует свою шапку и подвал из слота', (): void => {
        const fixture: TFixture = setup({});

        expect(qa(fixture, 'bottom-sheet-close')).not.toBeNull();
        expect(textOf(qa(fixture, 'bottom-sheet-title'))).toBe('Фильтры');
        expect(qa(fixture, 'slot-footer')).not.toBeNull();
    });

    it('SC-UKV-1750 — свой шаблон шапки встаёт на место кнопки закрытия, заголовка и действия', (): void => {
        const fixture: TFixture = setup({ header: true });

        expect(textOf(qa(fixture, 'own-title'))).toBe('Свои отборы');
        expect(qa(fixture, 'bottom-sheet-close')).toBeNull();
        expect(qa(fixture, 'bottom-sheet-title')).toBeNull();
        expect(qa(fixture, 'bottom-sheet-action')).toBeNull();
        expect(qa(fixture, 'bottom-sheet-handle')).not.toBeNull();
        expect((qa(fixture, 'bottom-sheet-header')?.nativeElement as HTMLElement).className).toContain('rt-bottom-sheet__header--own');
    });

    it('SC-UKV-1751 — свой шаблон подвала встаёт вместо узлов слота', (): void => {
        const fixture: TFixture = setup({ footer: true });

        const footer: HTMLElement = qa(fixture, 'bottom-sheet-footer')?.nativeElement as HTMLElement;

        expect(footer.querySelector('[qa-dataid="own-show"]')).not.toBeNull();
        expect(qa(fixture, 'slot-footer')).toBeNull();
    });

    it('SC-UKV-1752 — просьба закрыть из своего шаблона закрывает шторку', (): void => {
        const fixture: TFixture = setup({ header: true, footer: true });

        press(fixture, 'own-back');
        press(fixture, 'own-show');

        expect(fixture.componentInstance.changes).toEqual([false, false]);
    });

    it('SC-UKV-1752 — с неприменённым выбором просьба закрыть из своего шаблона сначала спрашивает', (): void => {
        const fixture: TFixture = setup({ header: true, unsaved: true });

        press(fixture, 'own-back');

        expect(qa(fixture, 'bottom-sheet-confirm')).not.toBeNull();
        expect(fixture.componentInstance.changes).toEqual([]);
    });
});
