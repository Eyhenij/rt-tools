import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { afterNextRender, ComponentRef, DestroyRef, effect, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { filter, merge, Observable, tap } from 'rxjs';

import { carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import { RtPopoverSheetComponent } from './rt-popover-sheet.component';
import { RtPopoverSheetOptionsDirective } from './rt-popover-sheet-options.directive';

/** Открытая шторка: её оверлей и сам компонент — их события закрывают панель. */
export interface IRtPopoverSheetOpened {
    overlayRef: OverlayRef;
    sheetRef: ComponentRef<RtPopoverSheetComponent>;
}

/** Что нужно шторке от директивы, которая её открывает. */
export interface IRtPopoverSheetRequest {
    overlay: Overlay;
    host: HTMLElement;
    viewContainerRef: ViewContainerRef;
    injector: Injector;
    template: TemplateRef<unknown>;
    context: unknown;
    title: string;
    /** Высота, действие в шапке и неприменённый выбор: шторка читает их, пока открыта. Нет — шторка без них. */
    options?: RtPopoverSheetOptionsDirective;
    /** Классы потребителя с `rtPopoverPanelClass`: в режиме шторки они ставятся на коробку оверлея, как у панели у триггера. */
    panelClasses?: readonly string[];
    /**
     * Шторка открыта и больше не `inert`: зовётся один раз после первой отрисовки с `open=true`. Фокус
     * переносится здесь, а не раньше — у закрытой шторки `inert` стоит, и `focus()` в неё ничего не делает.
     */
    onOpened?: () => void;
}

/** Шторки, которые уезжают вниз сейчас: каждая даёт способ снять себя сразу. */
const closingSheets: Set<() => void> = new Set<() => void>();

function finishClosingSheets(): void {
    for (const finish of Array.from(closingSheets)) {
        finish();
    }
}

/**
 * Входы шторки живут, пока она открыта: высота меняется, когда поиск внутри получает фокус, а
 * неприменённый выбор появляется с первой отметкой. Ответ «Применить» на вопрос шторки уходит
 * тому, кто её открыл. Слежение и подписка снимаются вместе с компонентом шторки.
 */
function bindSheetOptions(sheetRef: ComponentRef<RtPopoverSheetComponent>, options: RtPopoverSheetOptionsDirective | undefined): void {
    if (options === undefined) {
        return;
    }
    effect(
        (): void => {
            sheetRef.setInput('fullHeight', options.rtPopoverSheetFull());
            sheetRef.setInput('action', options.rtPopoverSheetAction());
            sheetRef.setInput('unsaved', options.rtPopoverSheetUnsaved());
            sheetRef.setInput('header', options.header());
            sheetRef.setInput('footer', options.footer());
        },
        { injector: sheetRef.injector }
    );
    outputToObservable(sheetRef.instance.applyRequest)
        .pipe(takeUntilDestroyed(sheetRef.injector.get(DestroyRef)))
        .subscribe((): void => options.rtPopoverSheetApply.emit());
}

/**
 * Открывает панель в нижней шторке. Шторка встаёт в свой оверлей на весь экран, а не в
 * привязанный к host'у: привязка, ширина по триггеру и подложка панели здесь не нужны. Тема куска
 * вокруг host'а и материальный набор едут на коробку шторки так же, как на панель. Шторка
 * создаётся закрытой и открывается после первой отрисовки — так она выезжает снизу, а не
 * появляется сразу на месте.
 */
export function rtOpenPopoverSheet(request: IRtPopoverSheetRequest): IRtPopoverSheetOpened {
    // Шторка, ещё уезжающая вниз, снимается сразу: её блокировка прокрутки держит `<html>`, и снятая
    // позже, она сняла бы блокировку у новой шторки, — страница поехала бы под ней.
    finishClosingSheets();
    const overlayRef: OverlayRef = request.overlay.create(
        new OverlayConfig({
            positionStrategy: request.overlay.position().global(),
            scrollStrategy: request.overlay.scrollStrategies.block(),
            panelClass: [...materialPresetClassesOf(request.host), ...(request.panelClasses ?? [])],
        })
    );
    carryThemeScope(overlayRef.overlayElement, request.host);
    const sheetRef: ComponentRef<RtPopoverSheetComponent> = overlayRef.attach(
        new ComponentPortal(RtPopoverSheetComponent, request.viewContainerRef)
    );
    sheetRef.setInput('template', request.template);
    sheetRef.setInput('context', request.context);
    sheetRef.setInput('title', request.title);
    bindSheetOptions(sheetRef, request.options);
    afterNextRender(
        (): void => {
            // Слой мог уйти до первой отрисовки: быстрое закрытие или снос директивы.
            if (!overlayRef.hasAttached()) {
                return;
            }
            sheetRef.setInput('open', true);
            // `inert` снимается привязкой хоста шторки: без этого прохода он ещё стоит, когда
            // зовётся обратный вызов, и `focus()` внутри шторки молча ничего не делает.
            sheetRef.changeDetectorRef.detectChanges();
            request.onOpened?.();
        },
        { injector: request.injector }
    );

    return { overlayRef, sheetRef };
}

/**
 * Намерения закрыть шторку: её подложка и ручка, а также Escape, пойманный оверлеем. Директива
 * закрывает по ним панель тем же `close()`, что и нажатие снаружи у панели рядом с триггером.
 */
export function rtPopoverSheetDismissals(sheet: IRtPopoverSheetOpened): Observable<unknown> {
    return merge(
        outputToObservable(sheet.sheetRef.instance.dismissed),
        // Escape идёт через саму шторку: с неприменённым выбором она сначала спрашивает, а закрытие
        // приходит её событием `dismissed`, как от кнопки и подложки.
        sheet.overlayRef.keydownEvents().pipe(
            filter((event: KeyboardEvent): boolean => event.key === 'Escape'),
            tap((event: KeyboardEvent): void => {
                event.preventDefault();
                sheet.sheetRef.instance.closeByEscape();
            }),
            filter((): boolean => false)
        )
    );
}

/** Запас к длительности выезда: таймер страхует событие окончания перехода и не должен его обгонять. */
const SHEET_CLOSE_TIMER_MARGIN_MS: number = 50;

/** Самая долгая из длительностей перехода, заданных строкой `transition-duration`: `0.25s, 120ms`. */
function longestDurationMs(value: string): number {
    return value
        .split(',')
        .map((part: string): number => {
            const text: string = part.trim();
            const amount: number = parseFloat(text);
            if (Number.isNaN(amount)) {
                return 0;
            }
            return text.endsWith('ms') ? amount : amount * 1000;
        })
        .reduce((longest: number, ms: number): number => Math.max(longest, ms), 0);
}

/** Узлы, на которые можно поставить фокус: к ним возвращается фокус, если сам host не фокусируется. */
const FOCUSABLE_SELECTOR: string =
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]';

/**
 * Куда вернуть фокус из шторки: сам host, если он фокусируется, иначе первый фокусируемый узел в нём.
 * У разделённой кнопки, «быстрого меню», фильтров списка бесед и подсказчика host — обёртка без
 * `tabindex`, и `focus()` на ней ничего не делает.
 */
export function rtPopoverSheetFocusTarget(host: HTMLElement): HTMLElement {
    if (host.matches(FOCUSABLE_SELECTOR)) {
        return host;
    }
    return host.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? host;
}

/** Класс панели шторки на время жеста: у него `transition: none`, и по нему длительность не измерить. */
const DRAGGING_PANEL_CLASS: string = 'rt-bottom-sheet__panel--dragging';

/** Ждёт конца выезда шторки вниз и снимает её оверлей; нулевая длительность снимает сразу. */
function slideOut(sheet: IRtPopoverSheetOpened, panel: HTMLElement): void {
    // Окно берётся у документа шторки, а не из глобального объекта; без окна переход не измерить.
    const view: Window | null = panel.ownerDocument.defaultView;
    const durationMs: number = view === null ? 0 : longestDurationMs(view.getComputedStyle(panel).transitionDuration);
    if (durationMs === 0) {
        sheet.overlayRef.dispose();
        return;
    }
    let disposed: boolean = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const listener: AbortController = new AbortController();
    const finish: () => void = (): void => {
        if (!disposed) {
            disposed = true;
            closingSheets.delete(finish);
            if (timer !== null) {
                clearTimeout(timer);
            }
            listener.abort();
            sheet.overlayRef.dispose();
        }
    };
    closingSheets.add(finish);
    timer = setTimeout(finish, durationMs + SHEET_CLOSE_TIMER_MARGIN_MS);
    // `transitionend` всплывает: переход цвета у кнопки или строки внутри шторки не должен её снимать.
    // Шторка выезжает по `transform` самой панели — только его окончание считается концом выезда.
    panel.addEventListener(
        'transitionend',
        (event: TransitionEvent): void => {
            if (event.target === panel && event.propertyName === 'transform') {
                finish();
            }
        },
        { signal: listener.signal }
    );
}

/**
 * Закрывает шторку: фокус, оказавшийся внутри, возвращается на `returnFocusTo` (или на первый
 * фокусируемый узел в нём), а сама шторка уезжает вниз и снимается после перехода. Длительность
 * читается из стиля панели шторки — её задаёт токен `--rt-duration-base`, а при отключённых переходах
 * она нулевая, и шторка снимается сразу. Страховочный таймер равен этой длительности: событие
 * окончания перехода не приходит, если вкладка скрыта или переход прерван. Шторка, закрытая
 * сдвигом вниз, ещё несёт класс жеста с `transition: none`: её длительность читается после
 * отрисовки, когда класс снят, иначе она вышла бы нулевой и шторка исчезала бы без выезда.
 */
export function rtClosePopoverSheet(sheet: IRtPopoverSheetOpened, returnFocusTo: HTMLElement | null): void {
    const overlayElement: HTMLElement = sheet.overlayRef.overlayElement;
    const active: Element | null = overlayElement.ownerDocument.activeElement;
    if (returnFocusTo !== null && active !== null && overlayElement.contains(active)) {
        rtPopoverSheetFocusTarget(returnFocusTo).focus();
    }
    const panel: HTMLElement | null = overlayElement.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-panel"]');
    sheet.sheetRef.setInput('open', false);
    if (panel === null) {
        sheet.overlayRef.dispose();
        return;
    }
    if (panel.classList.contains(DRAGGING_PANEL_CLASS)) {
        afterNextRender((): void => slideOut(sheet, panel), { injector: sheet.sheetRef.injector });
        return;
    }
    slideOut(sheet, panel);
}
