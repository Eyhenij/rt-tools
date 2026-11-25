import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { afterNextRender, ComponentRef, ErrorHandler, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

import { filter, merge, Observable, Subject, takeUntil, tap } from 'rxjs';

import { carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import type { RtPopoverSheetComponent } from './rt-popover-sheet.component';
import { sheetCodeState } from './rt-popover-sheet.code';

/**
 * Открытая шторка. Компонент листа приходит позже, чем ручка: его код подгружается при первом
 * открытии, а не на старте приложения. Ручка поэтому несёт оверлей и собственный поток намерений
 * закрыть, а не ссылку на компонент.
 */
export interface IRtPopoverSheetOpened {
    overlayRef: OverlayRef;
    /** Подложка и ручка листа: приходит, когда лист загрузился и пользователь их нажал, и при сбое загрузки. */
    dismissed: Observable<void>;
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

/** Компонент листа каждой открытой шторки; пока код листа не пришёл, записи нет. */
const attachedSheets: WeakMap<IRtPopoverSheetOpened, ComponentRef<RtPopoverSheetComponent>> = new WeakMap<
    IRtPopoverSheetOpened,
    ComponentRef<RtPopoverSheetComponent>
>();

/** Подгружает код листа ленивым `import()`; вызовы до прихода кода делят одно обещание. */
function loadSheetCode(): Promise<typeof RtPopoverSheetComponent> {
    if (sheetCodeState.loading === null) {
        sheetCodeState.loading = import('./rt-popover-sheet.component')
            .then((module: { RtPopoverSheetComponent: typeof RtPopoverSheetComponent }): typeof RtPopoverSheetComponent => {
                sheetCodeState.loaded = module.RtPopoverSheetComponent;
                return module.RtPopoverSheetComponent;
            })
            .catch((error: unknown): never => {
                sheetCodeState.loading = null;
                throw error;
            });
    }

    return sheetCodeState.loading;
}

/**
 * Подгружает код нижнего листа заранее. Первое открытие листа ждёт загрузки, а все следующие
 * берут готовый код сразу; приложение, которому первая задержка мешает, зовёт это в простое.
 */
export function rtPreloadPopoverSheet(): Promise<void> {
    return loadSheetCode().then((): void => undefined);
}

function finishClosingSheets(): void {
    for (const finish of Array.from(closingSheets)) {
        finish();
    }
}

/**
 * Открывает панель в нижней шторке. Шторка встаёт в свой оверлей на весь экран, а не в
 * привязанный к host'у: привязка, ширина по триггеру и подложка панели здесь не нужны. Тема куска
 * вокруг host'а и материальный набор едут на коробку шторки так же, как на панель. Шторка
 * создаётся закрытой и открывается после первой отрисовки — так она выезжает снизу, а не
 * появляется сразу на месте. Ручка возвращается сразу, а лист подгружается: закрытие, снос и
 * повторное открытие до его прихода снимают оверлей, и пришедший лист не создаётся.
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
    const errors: ErrorHandler = request.injector.get(ErrorHandler);
    const dismissedSource: Subject<void> = new Subject<void>();
    const sheet: IRtPopoverSheetOpened = { overlayRef, dismissed: dismissedSource.asObservable() };

    const attach: (sheetComponent: typeof RtPopoverSheetComponent) => void = (sheetComponent: typeof RtPopoverSheetComponent): void => {
        // Слой снят, пока код шёл: закрытие, снос директивы или новое открытие.
        const host: HTMLElement | null = overlayRef.hostElement;
        if (host?.isConnected !== true) {
            return;
        }
        const sheetRef: ComponentRef<RtPopoverSheetComponent> = overlayRef.attach(
            new ComponentPortal(sheetComponent, request.viewContainerRef)
        );
        attachedSheets.set(sheet, sheetRef);
        sheetRef.setInput('template', request.template);
        sheetRef.setInput('context', request.context);
        sheetRef.setInput('title', request.title);
        outputToObservable(sheetRef.instance.dismissed)
            .pipe(takeUntil(overlayRef.detachments()))
            .subscribe((): void => dismissedSource.next());
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
    };

    const loaded: typeof RtPopoverSheetComponent | null = sheetCodeState.loaded;
    if (loaded !== null) {
        attach(loaded);
    } else {
        loadSheetCode()
            .then(attach)
            .catch((error: unknown): void => {
                // Код листа не пришёл или лист не встал: оверлей снимается, панель закрывается тем же путём,
                // что и по подложке. Закрытие не зависит от обработчика ошибок: он может сам бросить.
                overlayRef.dispose();
                try {
                    errors.handleError(error);
                } finally {
                    dismissedSource.next();
                }
            });
    }

    return sheet;
}

/**
 * Намерения закрыть шторку: её подложка и ручка, а также Escape, пойманный оверлеем. Директива
 * закрывает по ним панель тем же `close()`, что и нажатие снаружи у панели рядом с триггером.
 */
export function rtPopoverSheetDismissals(sheet: IRtPopoverSheetOpened): Observable<unknown> {
    return merge(
        sheet.dismissed,
        sheet.overlayRef.keydownEvents().pipe(
            filter((event: KeyboardEvent): boolean => event.key === 'Escape'),
            tap((event: KeyboardEvent): void => event.preventDefault())
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
    const sheetRef: ComponentRef<RtPopoverSheetComponent> | undefined = attachedSheets.get(sheet);
    // Лист ещё не пришёл или оверлей уже снят: снимать нечего, а пришедший код листа оверлея не найдёт.
    if (sheetRef === undefined || !sheet.overlayRef.hasAttached()) {
        sheet.overlayRef.dispose();
        return;
    }
    const overlayElement: HTMLElement = sheet.overlayRef.overlayElement;
    const active: Element | null = overlayElement.ownerDocument.activeElement;
    if (returnFocusTo !== null && active !== null && overlayElement.contains(active)) {
        rtPopoverSheetFocusTarget(returnFocusTo).focus();
    }
    const panel: HTMLElement | null = overlayElement.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-panel"]');
    sheetRef.setInput('open', false);
    if (panel === null) {
        sheet.overlayRef.dispose();
        return;
    }
    if (panel.classList.contains(DRAGGING_PANEL_CLASS)) {
        afterNextRender((): void => slideOut(sheet, panel), { injector: sheetRef.injector });
        return;
    }
    slideOut(sheet, panel);
}
