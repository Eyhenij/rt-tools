import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, renderedText, setInputs } from '../../../testing/rt-kit-testing';
import { DRAG_DISMISS_THRESHOLD_PX } from './rt-bottom-sheet.logic';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Заголовок и содержимое приходят проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-bottom-sheet-host',
    template: `
        <rt-bottom-sheet [open]="open()" (openChange)="lastChange = $event">
            <h2 sheetHeader>Фильтры</h2>
            <p>Содержимое листа</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetHostComponent {
    public readonly open: WritableSignal<boolean> = signal<boolean>(true);
    public lastChange: boolean | null = null;
}

function setup(open: boolean = true): ComponentFixture<RtBottomSheetComponent> {
    return createRtFixture(RtBottomSheetComponent, { open });
}

/**
 * В jsdom нет `PointerEvent`, а обработчики слушают именно эти имена событий.
 * `MouseEvent` несёт нужный `clientY` и доходит до тех же слушателей.
 */
function pointer(type: string, clientY: number): MouseEvent {
    return new MouseEvent(type, { clientY, bubbles: true });
}

function drag<T>(fixture: ComponentFixture<T>, distance: number): void {
    qa(fixture, 'bottom-sheet-handle')?.nativeElement.dispatchEvent(pointer('pointerdown', 0));
    fixture.detectChanges();
    document.dispatchEvent(pointer('pointermove', distance));
    fixture.detectChanges();
    document.dispatchEvent(pointer('pointerup', 0));
    fixture.detectChanges();
}

describe('RtBottomSheetComponent', (): void => {
    it('раскрытый лист помечает host модификатором', (): void => {
        expect(hostClasses(setup(true))).toContain('rt-bottom-sheet--open');
    });

    it('закрытый лист остаётся в разметке без модификатора — прячут его стили', (): void => {
        // Компонент не размонтируется: анимацию открытия и закрытия рисует CSS,
        // а исчезнувший из DOM узел анимировать нечем.
        const fixture: ComponentFixture<RtBottomSheetComponent> = setup(false);

        expect(hostClasses(fixture)).not.toContain('rt-bottom-sheet--open');
        expect(qa(fixture, 'bottom-sheet-panel')).not.toBeNull();
    });

    it('панель объявлена модальным диалогом', (): void => {
        const panel: HTMLElement = qa(setup(), 'bottom-sheet-panel')?.nativeElement as HTMLElement;

        expect(panel.getAttribute('role')).toBe('dialog');
        expect(panel.getAttribute('aria-modal')).toBe('true');
    });

    it('подложка — настоящая кнопка с переведённой подписью, а не немой див', (): void => {
        const backdrop: HTMLButtonElement = qa(setup(), 'bottom-sheet-backdrop')?.nativeElement as HTMLButtonElement;

        expect(backdrop.tagName).toBe('BUTTON');
        expect(backdrop.getAttribute('aria-label')).toBe('Close');
    });

    it('клик по подложке просит закрыть лист', (): void => {
        // Компонент не закрывает себя сам: состоянием владеет потребитель.
        const fixture: ComponentFixture<RtBottomSheetComponent> = setup();
        const changes: boolean[] = [];
        fixture.componentInstance.openChange.subscribe((value: boolean): void => {
            changes.push(value);
        });

        qa(fixture, 'bottom-sheet-backdrop')?.nativeElement.click();
        fixture.detectChanges();

        expect(changes).toEqual([false]);
    });

    describe('свайп', (): void => {
        it('короткий свайп не закрывает лист', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            drag(fixture, DRAG_DISMISS_THRESHOLD_PX);

            expect(fixture.componentInstance.lastChange).toBeNull();
        });

        it('свайп за порог просит закрыть лист', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            drag(fixture, DRAG_DISMISS_THRESHOLD_PX + 1);

            expect(fixture.componentInstance.lastChange).toBe(false);
        });

        it('во время перетаскивания панель едет за пальцем и помечается модификатором', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = setup();

            qa(fixture, 'bottom-sheet-handle')?.nativeElement.dispatchEvent(pointer('pointerdown', 0));
            fixture.detectChanges();
            document.dispatchEvent(pointer('pointermove', 40));
            fixture.detectChanges();

            const panel: HTMLElement = qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement;
            expect(panel.classList.contains('rt-bottom-sheet__panel--dragging')).toBe(true);
            expect(panel.style.transform).toBe('translateY(40px)');

            document.dispatchEvent(pointer('pointerup', 0));
            fixture.detectChanges();
        });

        it('вверх лист не тянется — отрицательный сдвиг обнуляется', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = setup();

            qa(fixture, 'bottom-sheet-handle')?.nativeElement.dispatchEvent(pointer('pointerdown', 100));
            fixture.detectChanges();
            document.dispatchEvent(pointer('pointermove', 20));
            fixture.detectChanges();

            expect((qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement).style.transform).toBe('translateY(0px)');

            document.dispatchEvent(pointer('pointerup', 0));
            fixture.detectChanges();
        });

        it('после отпускания сдвиг сбрасывается', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = setup();

            drag(fixture, 40);

            expect((qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement).style.transform).toBe('');
        });
    });

    describe('проекция', (): void => {
        it('заголовок попадает в свой слот', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            expect((qa(fixture, 'bottom-sheet-header')?.nativeElement as HTMLElement).textContent?.trim()).toBe('Фильтры');
        });

        it('остальное содержимое рисуется под заголовком', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            expect(renderedText(fixture)).toContain('Содержимое листа');
        });
    });

    it('состояние приходит только входом — сам себя лист не открывает', (): void => {
        const fixture: ComponentFixture<RtBottomSheetComponent> = setup(false);

        setInputs(fixture, { open: true });
        fixture.detectChanges();

        expect(hostClasses(fixture)).toContain('rt-bottom-sheet--open');
    });
});
