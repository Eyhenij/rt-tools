import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Шторка в шаблоне своей части: открывает её кнопка рядом, как у отборов страницы и полей даты. */
@Component({
    selector: 'rt-bottom-sheet-focus-host',
    template: `
        <button type="button" qa-dataid="opener" (click)="open.set(true)">Открыть</button>
        <div qa-dataid="outer" (keydown.escape)="outerEscapes = outerEscapes + 1">
            <rt-bottom-sheet
                [open]="open()"
                [unsaved]="unsaved()"
                (openChange)="open.set($event)"
                (discardRequest)="discarded = discarded + 1">
                <h2 sheetHeader>Фильтры</h2>
                <input qa-dataid="field" />
            </rt-bottom-sheet>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetFocusHostComponent {
    public readonly open: WritableSignal<boolean> = signal<boolean>(false);
    public readonly unsaved: WritableSignal<boolean> = signal<boolean>(false);
    public outerEscapes: number = 0;
    public discarded: number = 0;
}

type TFixture = ComponentFixture<BottomSheetFocusHostComponent>;

/** Сам узел с якорем: панель, подложка, поле. */
function raw(fixture: TFixture, id: string): HTMLElement {
    return qa(fixture, id)?.nativeElement as HTMLElement;
}

/** Кнопка под якорем: якорь стоит на теге кнопки кита или на самой кнопке. */
function node(fixture: TFixture, id: string): HTMLElement {
    const found: HTMLElement = raw(fixture, id);

    return found.querySelector('button') ?? found;
}

function settle(fixture: TFixture): void {
    fixture.detectChanges();
    fixture.detectChanges();
}

/** Шторка открыта кнопкой рядом: фокус в минуту открытия стоит на ней. */
function setup(unsaved: boolean = false): TFixture {
    const fixture: TFixture = createRtFixture(BottomSheetFocusHostComponent);
    fixture.componentInstance.unsaved.set(unsaved);
    node(fixture, 'opener').focus();
    node(fixture, 'opener').click();
    settle(fixture);

    return fixture;
}

function press(fixture: TFixture, id: string): void {
    node(fixture, id).click();
    settle(fixture);
}

function escapeOn(target: EventTarget): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    target.dispatchEvent(event);

    return event;
}

describe('RtBottomSheetComponent — фокус и Escape', (): void => {
    it('SC-UKV-1756 — вопрос берёт фокус на ответ «применить», шторка под ним недоступна, «Отмена» возвращает фокус', (): void => {
        const fixture: TFixture = setup(true);
        node(fixture, 'bottom-sheet-close').focus();

        press(fixture, 'bottom-sheet-close');

        expect(document.activeElement).toBe(node(fixture, 'bottom-sheet-confirm-apply'));
        expect(raw(fixture, 'bottom-sheet-panel').hasAttribute('inert')).toBe(true);
        expect(raw(fixture, 'bottom-sheet-backdrop').hasAttribute('inert')).toBe(true);

        press(fixture, 'bottom-sheet-confirm-cancel');

        expect(raw(fixture, 'bottom-sheet-panel').hasAttribute('inert')).toBe(false);
        expect(document.activeElement).toBe(node(fixture, 'bottom-sheet-close'));
    });

    it('SC-UKV-1757 — закрытая шторка возвращает фокус на узел, с которого её открыли', (): void => {
        const fixture: TFixture = setup();
        node(fixture, 'bottom-sheet-close').focus();

        press(fixture, 'bottom-sheet-close');

        expect(fixture.componentInstance.open()).toBe(false);
        expect(document.activeElement).toBe(node(fixture, 'opener'));
    });

    it('SC-UKV-1757 — фокус, который уже увели в другое место, шторка не трогает', (): void => {
        const fixture: TFixture = setup();
        const elsewhere: HTMLButtonElement = document.createElement('button');
        document.body.append(elsewhere);
        elsewhere.focus();

        fixture.componentInstance.open.set(false);
        settle(fixture);

        expect(document.activeElement).toBe(elsewhere);
        elsewhere.remove();
    });

    it('SC-UKV-1758 — Escape с фокусом в шторке закрывает её и дальше не идёт: слой вокруг клавишу не получает', (): void => {
        const fixture: TFixture = setup();

        const event: KeyboardEvent = escapeOn(raw(fixture, 'field'));
        settle(fixture);

        expect(fixture.componentInstance.open()).toBe(false);
        expect(event.defaultPrevented).toBe(true);
        expect(fixture.componentInstance.outerEscapes).toBe(0);
    });

    it('SC-UKV-1758 — Escape, уже взятый слоем над шторкой, её не закрывает', (): void => {
        const fixture: TFixture = setup();
        const above: HTMLElement = document.createElement('div');
        above.addEventListener('keydown', (event: KeyboardEvent): void => event.preventDefault());
        document.body.append(above);

        escapeOn(above);
        settle(fixture);

        expect(fixture.componentInstance.open()).toBe(true);
        above.remove();
    });

    it('SC-UKV-1759 — «Не применять» сообщает наружу, что неприменённое отброшено, и закрывает шторку', (): void => {
        const fixture: TFixture = setup(true);
        press(fixture, 'bottom-sheet-close');

        press(fixture, 'bottom-sheet-confirm-discard');

        expect(fixture.componentInstance.discarded).toBe(1);
        expect(fixture.componentInstance.open()).toBe(false);
    });

    it('SC-UKV-1789 — свайп вниз при неприменённом выборе спрашивает, шторка остаётся открытой', (): void => {
        const fixture: TFixture = setup(true);
        const handle: HTMLElement = raw(fixture, 'bottom-sheet-handle');

        handle.dispatchEvent(new MouseEvent('pointerdown', { clientY: 100, bubbles: true }));
        document.dispatchEvent(new MouseEvent('pointermove', { clientY: 400 }));
        document.dispatchEvent(new MouseEvent('pointerup', { clientY: 400 }));
        settle(fixture);

        expect(qa(fixture, 'bottom-sheet-confirm')).not.toBeNull();
        expect(fixture.componentInstance.open()).toBe(true);
    });

    it('SC-UKV-1756 — закрыть просили свайпом: после «Отмены» фокус берёт панель шторки, а не страница под ней', (): void => {
        const fixture: TFixture = setup(true);
        const handle: HTMLElement = raw(fixture, 'bottom-sheet-handle');

        handle.dispatchEvent(new MouseEvent('pointerdown', { clientY: 100, bubbles: true }));
        document.dispatchEvent(new MouseEvent('pointermove', { clientY: 400 }));
        document.dispatchEvent(new MouseEvent('pointerup', { clientY: 400 }));
        settle(fixture);
        press(fixture, 'bottom-sheet-confirm-cancel');

        expect(document.activeElement).toBe(raw(fixture, 'bottom-sheet-panel'));
    });

    it('SC-UKV-1788 — открытая шторка в шаблоне страницы сама подгружает стили блокировки прокрутки', (): void => {
        document.querySelector('.cdk-overlay-container')?.remove();

        setup();

        // Правило блокировки лежит в стилях оверлея CDK; их грузит контейнер оверлеев. Сама
        // блокировка в среде без раскладки не ставится: странице там нечего прокручивать.
        expect(document.querySelector('.cdk-overlay-container')).not.toBeNull();
    });

    it('SC-UKV-1783 — высота под клавиатуру следующему открытию не достаётся', (): void => {
        const viewport: EventTarget & { height: number; offsetTop: number; scale: number } = Object.assign(new EventTarget(), {
            height: window.innerHeight - 300,
            offsetTop: 0,
            scale: 1,
        });
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
        const fixture: TFixture = setup();
        const panel: HTMLElement = raw(fixture, 'bottom-sheet-panel');

        raw(fixture, 'field').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        settle(fixture);
        expect(panel.classList).toContain('rt-bottom-sheet__panel--typing');

        fixture.componentInstance.open.set(false);
        settle(fixture);
        fixture.componentInstance.open.set(true);
        settle(fixture);

        expect(panel.classList).not.toContain('rt-bottom-sheet__panel--typing');
        Reflect.deleteProperty(window, 'visualViewport');
    });
});
