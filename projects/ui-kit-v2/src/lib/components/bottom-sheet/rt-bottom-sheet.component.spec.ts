import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, hostClasses, qa, renderedText, setInputs } from '../../../testing/rt-kit-testing';
import { DRAG_DISMISS_THRESHOLD_PX } from './rt-bottom-sheet.logic';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/**
 * Открытость, написанная голым атрибутом: именно так её пишут у соседей по киту, и именно так
 * она приходила входу пустой строкой.
 */
@Component({
    selector: 'rt-bottom-sheet-bare-host',
    template: `
        <rt-bottom-sheet open />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetBareHostComponent {}

/** Строка «false» в атрибуте — единственная непустая строка, которую превращение считает ложью. */
@Component({
    selector: 'rt-bottom-sheet-false-host',
    template: `
        <rt-bottom-sheet open="false" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetFalseHostComponent {}

/** Классы самого листа внутри host-обёртки: `hostClasses` берёт корень фикстуры, а он здесь чужой. */
function sheetClasses<T>(fixture: ComponentFixture<T>): string[] {
    const sheet: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector('rt-bottom-sheet');

    return sheet === null ? [] : Array.from(sheet.classList);
}

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

/** Подвал приходит своим слотом — кнопки, которые не уезжают с прокруткой тела. */
@Component({
    selector: 'rt-bottom-sheet-footer-host',
    template: `
        <rt-bottom-sheet [open]="true" (openChange)="lastChange = $event">
            <h2 sheetHeader>Фильтры</h2>
            <p>Содержимое листа</p>
            <button sheetFooter type="button">Применить</button>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetFooterHostComponent {
    public lastChange: boolean | null = null;
}

/** Действие шторки приходит своим слотом — кнопка справа в шапке. */
@Component({
    selector: 'rt-bottom-sheet-action-host',
    template: `
        <rt-bottom-sheet [open]="true">
            <h2 sheetHeader>Каналы</h2>
            <button sheetAction type="button">Готово</button>
            <p>Содержимое листа</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetActionHostComponent {}

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

    it('закрытый лист выключен из табуляции и дерева доступности', (): void => {
        // Стили прячут его прозрачностью, а она не убирает ни кнопку подложки
        // из порядка табуляции, ни объявление диалога у скринридера.
        const fixture: ComponentFixture<RtBottomSheetComponent> = setup(false);

        expect(fixture.nativeElement.getAttribute('inert')).toBe('');
    });

    it('раскрытый лист снова доступен', (): void => {
        const fixture: ComponentFixture<RtBottomSheetComponent> = setup(false);

        setInputs(fixture, { open: true });
        fixture.detectChanges();

        expect(fixture.nativeElement.getAttribute('inert')).toBeNull();
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

        it('SC-UKV-1921 — прерванный системой жест возвращает панель и не закрывает шторку следующим касанием', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            qa(fixture, 'bottom-sheet-handle')?.nativeElement.dispatchEvent(pointer('pointerdown', 0));
            fixture.detectChanges();
            document.dispatchEvent(pointer('pointermove', DRAG_DISMISS_THRESHOLD_PX + 1));
            fixture.detectChanges();
            document.dispatchEvent(pointer('pointercancel', 0));
            fixture.detectChanges();

            const panel: HTMLElement = qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement;
            expect(panel.classList.contains('rt-bottom-sheet__panel--dragging')).toBe(false);
            expect(panel.style.transform).toBe('');

            // Касание где угодно после прерванного жеста — не конец перетаскивания.
            document.dispatchEvent(pointer('pointermove', DRAG_DISMISS_THRESHOLD_PX + 50));
            document.dispatchEvent(pointer('pointerup', 0));
            fixture.detectChanges();

            expect(fixture.componentInstance.lastChange).toBeNull();
        });

        it('SC-UKV-1921 — второе касание ручки посреди жеста не сбрасывает сдвиг', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = setup();
            const handle: HTMLElement = qa(fixture, 'bottom-sheet-handle')?.nativeElement as HTMLElement;

            handle.dispatchEvent(pointer('pointerdown', 0));
            fixture.detectChanges();
            document.dispatchEvent(pointer('pointermove', 60));
            fixture.detectChanges();
            handle.dispatchEvent(pointer('pointerdown', 50));
            document.dispatchEvent(pointer('pointermove', 60));
            fixture.detectChanges();

            expect((qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement).style.transform).toBe('translateY(60px)');

            document.dispatchEvent(pointer('pointerup', 0));
            fixture.detectChanges();
        });

        it('SC-UKV-1921 — шторка, убранная посреди жеста, не слушает касания документа', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = setup();
            const removed: string[] = [];
            const remove: typeof document.removeEventListener = document.removeEventListener.bind(document);
            jest.spyOn(document, 'removeEventListener').mockImplementation(
                (type: string, ...rest: [EventListenerOrEventListenerObject, (boolean | EventListenerOptions)?]): void => {
                    removed.push(type);
                    remove(type, ...rest);
                }
            );

            qa(fixture, 'bottom-sheet-handle')?.nativeElement.dispatchEvent(pointer('pointerdown', 0));
            fixture.detectChanges();
            fixture.destroy();

            expect(removed).toEqual(expect.arrayContaining(['pointermove', 'pointerup', 'pointercancel']));
            jest.restoreAllMocks();
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

        it('содержимое по умолчанию лежит в теле — единственной прокручиваемой зоне', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);
            const body: HTMLElement = qa(fixture, 'bottom-sheet-body')?.nativeElement as HTMLElement;

            expect(body.classList).toContain('rt-bottom-sheet__body');
            expect(body.textContent?.trim()).toBe('Содержимое листа');
        });

        it('подвал попадает в свой слот после тела, а не в тело', (): void => {
            const fixture: ComponentFixture<BottomSheetFooterHostComponent> = createRtFixture(BottomSheetFooterHostComponent);
            const body: HTMLElement = qa(fixture, 'bottom-sheet-body')?.nativeElement as HTMLElement;
            const footer: HTMLElement = qa(fixture, 'bottom-sheet-footer')?.nativeElement as HTMLElement;

            expect(footer.classList).toContain('rt-bottom-sheet__footer');
            expect(footer.textContent?.trim()).toBe('Применить');
            expect(body.textContent).not.toContain('Применить');
            expect(body.nextElementSibling).toBe(footer);
        });

        it('без спроецированного подвала элемент пуст — правило :empty убирает его из раскладки', (): void => {
            // Ни пробела, ни перевода строки: текстовый узел снял бы с элемента :empty,
            // и пустой подвал занял бы место с линией сверху. Узел-комментарий ветки шаблона :empty не
            // снимает: он не элемент и не текст.
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);
            const footer: HTMLElement = qa(fixture, 'bottom-sheet-footer')?.nativeElement as HTMLElement;
            const drawn: ChildNode[] = Array.from(footer.childNodes).filter(
                (node: ChildNode): boolean => node.nodeType !== Node.COMMENT_NODE
            );

            expect(drawn.length).toBe(0);
            expect(footer.matches(':empty')).toBe(true);
        });

        it('свайп за подвал лист не тянет — тянет только ручка', (): void => {
            const fixture: ComponentFixture<BottomSheetFooterHostComponent> = createRtFixture(BottomSheetFooterHostComponent);

            qa(fixture, 'bottom-sheet-footer')?.nativeElement.dispatchEvent(pointer('pointerdown', 0));
            fixture.detectChanges();
            document.dispatchEvent(pointer('pointermove', DRAG_DISMISS_THRESHOLD_PX + 1));
            fixture.detectChanges();

            const panel: HTMLElement = qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement;
            expect(panel.classList.contains('rt-bottom-sheet__panel--dragging')).toBe(false);

            document.dispatchEvent(pointer('pointerup', 0));
            fixture.detectChanges();

            expect(fixture.componentInstance.lastChange).toBeNull();
        });
    });

    describe('форма записи открытости — SC-UKV-235, SC-UKV-134, SC-UKV-135', (): void => {
        it('SC-UKV-235 — голый атрибут ставит логическому входу истину', (): void => {
            const fixture: ComponentFixture<BottomSheetBareHostComponent> = createRtFixture(BottomSheetBareHostComponent);

            expect(sheetClasses(fixture)).toContain('rt-bottom-sheet--open');
        });

        it('SC-UKV-134 — обязательный вход берёт голый атрибут так же', (): void => {
            // Вход объявлен обязательным: без атрибута Angular отказал бы на подъёме компонента.
            // С голым атрибутом он поднимается и получает истину, а не пустую строку.
            const fixture: ComponentFixture<BottomSheetBareHostComponent> = createRtFixture(BottomSheetBareHostComponent);

            expect(sheetClasses(fixture)).toContain('rt-bottom-sheet--open');
            expect(sheetClasses(fixture)).not.toContain('rt-bottom-sheet--closed');
        });

        it('SC-UKV-135 — строка «false» в атрибуте остаётся ложью', (): void => {
            const fixture: ComponentFixture<BottomSheetFalseHostComponent> = createRtFixture(BottomSheetFalseHostComponent);

            expect(sheetClasses(fixture)).not.toContain('rt-bottom-sheet--open');
        });
    });

    it('состояние приходит только входом — сам себя лист не открывает', (): void => {
        const fixture: ComponentFixture<RtBottomSheetComponent> = setup(false);

        setInputs(fixture, { open: true });
        fixture.detectChanges();

        expect(hostClasses(fixture)).toContain('rt-bottom-sheet--open');
    });

    describe('шапка', (): void => {
        it('SC-UKV-1790 — кнопка закрытия стоит в шапке первой, заголовок — в своей ячейке по центру', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);
            const header: HTMLElement = qa(fixture, 'bottom-sheet-header')?.nativeElement as HTMLElement;
            const close: HTMLElement = qa(fixture, 'bottom-sheet-close')?.nativeElement as HTMLElement;

            expect(header.firstElementChild?.contains(close)).toBe(true);
            expect(close.querySelector('button')?.getAttribute('aria-label')).toBe('Close');
            expect((qa(fixture, 'bottom-sheet-title')?.nativeElement as HTMLElement).textContent?.trim()).toBe('Фильтры');
        });

        it('SC-UKV-1790 — кнопка закрытия просит закрыть лист так же, как подложка', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            // Якорь стоит на теге кнопки кита, а нажимают её внутреннюю кнопку.
            (qa(fixture, 'bottom-sheet-close')?.nativeElement as HTMLElement).querySelector('button')?.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.lastChange).toBe(false);
        });

        it('SC-UKV-1792 — без заголовка кнопка закрытия остаётся, ячейка заголовка пуста', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = setup();

            expect(qa(fixture, 'bottom-sheet-close')).not.toBeNull();
            expect((qa(fixture, 'bottom-sheet-title')?.nativeElement as HTMLElement).textContent?.trim()).toBe('');
        });

        it('действие шторки приходит своим слотом и встаёт в шапке последним', (): void => {
            const fixture: ComponentFixture<BottomSheetActionHostComponent> = createRtFixture(BottomSheetActionHostComponent);
            const header: HTMLElement = qa(fixture, 'bottom-sheet-header')?.nativeElement as HTMLElement;
            const action: HTMLElement = qa(fixture, 'bottom-sheet-action')?.nativeElement as HTMLElement;

            expect(header.lastElementChild).toBe(action);
            expect(action.textContent?.trim()).toBe('Готово');
            expect((qa(fixture, 'bottom-sheet-body')?.nativeElement as HTMLElement).textContent).not.toContain('Готово');
        });
    });

    describe('высота', (): void => {
        it('по умолчанию панель растёт по содержимому — модификатора полной высоты нет', (): void => {
            expect(classesOf(qa(setup(), 'bottom-sheet-panel'))).not.toContain('rt-bottom-sheet__panel--full');
        });

        it('вход fullHeight ставит панели модификатор полной высоты', (): void => {
            const fixture: ComponentFixture<RtBottomSheetComponent> = createRtFixture(RtBottomSheetComponent, {
                open: true,
                fullHeight: true,
            });

            expect(classesOf(qa(fixture, 'bottom-sheet-panel'))).toContain('rt-bottom-sheet__panel--full');
        });
    });

    describe('Escape и прокрутка страницы', (): void => {
        function escape(): void {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        }

        it('Escape просит закрыть открытый лист', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);

            escape();
            fixture.detectChanges();

            expect(fixture.componentInstance.lastChange).toBe(false);
        });

        it('Escape закрытому листу ничего не говорит', (): void => {
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(BottomSheetHostComponent);
            fixture.componentInstance.open.set(false);
            fixture.detectChanges();

            escape();
            fixture.detectChanges();

            expect(fixture.componentInstance.lastChange).toBeNull();
        });

        it('открытый лист держит прокрутку страницы, закрытый отпускает', (): void => {
            const calls: string[] = [];
            const lock: Pick<ScrollStrategy, 'enable' | 'disable'> = {
                enable: (): void => void calls.push('enable'),
                disable: (): void => void calls.push('disable'),
            };
            const fixture: ComponentFixture<BottomSheetHostComponent> = createRtFixture(
                BottomSheetHostComponent,
                {},
                { providers: [{ provide: ScrollStrategyOptions, useValue: { block: (): typeof lock => lock } }] }
            );

            expect(calls).toEqual(['enable']);

            fixture.componentInstance.open.set(false);
            fixture.detectChanges();

            expect(calls).toEqual(['enable', 'disable']);
        });
    });
});
