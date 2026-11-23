import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/**
 * Шторка, у которой выбор уходит в приложение только по кнопке: вход `unsaved` говорит, что
 * выбор изменён и не применён, а что делать с закрытием — решает ответ человека на вопрос.
 */
@Component({
    selector: 'rt-bottom-sheet-unsaved-host',
    template: `
        <rt-bottom-sheet [open]="open()" [unsaved]="unsaved()" (openChange)="changes.push($event)" (applyRequest)="applied = applied + 1">
            <h2 sheetHeader>Фильтры</h2>
            <p>Содержимое листа</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetUnsavedHostComponent {
    public readonly open: WritableSignal<boolean> = signal<boolean>(true);
    public readonly unsaved: WritableSignal<boolean> = signal<boolean>(true);
    public readonly changes: boolean[] = [];
    public applied: number = 0;
}

type TFixture = ComponentFixture<BottomSheetUnsavedHostComponent>;

function setup(unsaved: boolean = true): TFixture {
    const fixture: TFixture = createRtFixture(BottomSheetUnsavedHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.unsaved.set(unsaved);
    fixture.detectChanges();

    return fixture;
}

/** Якорь стоит на теге кнопки кита или на самой кнопке — нажимается внутренняя кнопка, если она есть. */
function press(fixture: TFixture, id: string): void {
    const node: HTMLElement = qa(fixture, id)?.nativeElement as HTMLElement;
    (node.querySelector('button') ?? node).click();
    fixture.detectChanges();
}

describe('RtBottomSheetComponent — вопрос перед закрытием', (): void => {
    it('SC-UKV-1723 — кнопка закрытия при неприменённом выборе показывает вопрос, шторка остаётся открытой', (): void => {
        const fixture: TFixture = setup();

        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();

        press(fixture, 'bottom-sheet-close');

        expect(qa(fixture, 'bottom-sheet-confirm')).not.toBeNull();
        expect(textOf(qa(fixture, 'bottom-sheet-confirm-title'))).toBe('Apply the changes?');
        expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('SC-UKV-1723 — подложка и Escape спрашивают так же', (): void => {
        const fixture: TFixture = setup();

        press(fixture, 'bottom-sheet-backdrop');
        expect(qa(fixture, 'bottom-sheet-confirm')).not.toBeNull();

        press(fixture, 'bottom-sheet-confirm-cancel');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();

        expect(qa(fixture, 'bottom-sheet-confirm')).not.toBeNull();
        expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('SC-UKV-1724 — «Применить» просит приложение применить и закрыть, сам вопрос уходит', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'bottom-sheet-close');

        press(fixture, 'bottom-sheet-confirm-apply');

        expect(fixture.componentInstance.applied).toBe(1);
        expect(fixture.componentInstance.changes).toEqual([false]);
        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
    });

    it('SC-UKV-1724 — «Не применять» закрывает шторку без применения', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'bottom-sheet-close');

        press(fixture, 'bottom-sheet-confirm-discard');

        expect(fixture.componentInstance.applied).toBe(0);
        expect(fixture.componentInstance.changes).toEqual([false]);
        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
    });

    it('SC-UKV-1724 — «Отмена» убирает вопрос и оставляет шторку открытой', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'bottom-sheet-close');

        press(fixture, 'bottom-sheet-confirm-cancel');

        expect(fixture.componentInstance.applied).toBe(0);
        expect(fixture.componentInstance.changes).toEqual([]);
        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
    });

    it('SC-UKV-1725 — без изменений шторка закрывается сразу, вопроса нет', (): void => {
        const fixture: TFixture = setup(false);

        press(fixture, 'bottom-sheet-close');

        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
        expect(fixture.componentInstance.changes).toEqual([false]);
    });

    it('закрытая снаружи шторка вопрос за собой не оставляет', (): void => {
        const fixture: TFixture = setup();
        press(fixture, 'bottom-sheet-close');

        fixture.componentInstance.open.set(false);
        fixture.detectChanges();
        fixture.componentInstance.open.set(true);
        fixture.detectChanges();

        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
    });
});
