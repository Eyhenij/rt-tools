import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { afterNextRender, ComponentRef, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

import { filter, merge, Observable, tap } from 'rxjs';

import { carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import { RtPopoverSheetComponent } from './rt-popover-sheet.component';

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
}

/**
 * Открывает панель в нижней шторке. Шторка встаёт в свой оверлей на весь экран, а не в
 * привязанный к host'у: привязка, ширина по триггеру и подложка панели здесь не нужны. Тема куска
 * вокруг host'а и материальный набор едут на коробку шторки так же, как на панель. Шторка
 * создаётся закрытой и открывается после первой отрисовки — так она выезжает снизу, а не
 * появляется сразу на месте.
 */
export function rtOpenPopoverSheet(request: IRtPopoverSheetRequest): IRtPopoverSheetOpened {
    const overlayRef: OverlayRef = request.overlay.create(
        new OverlayConfig({
            positionStrategy: request.overlay.position().global(),
            scrollStrategy: request.overlay.scrollStrategies.block(),
            panelClass: materialPresetClassesOf(request.host),
        })
    );
    carryThemeScope(overlayRef.overlayElement, request.host);
    const sheetRef: ComponentRef<RtPopoverSheetComponent> = overlayRef.attach(
        new ComponentPortal(RtPopoverSheetComponent, request.viewContainerRef)
    );
    sheetRef.setInput('template', request.template);
    sheetRef.setInput('context', request.context);
    sheetRef.setInput('title', request.title);
    afterNextRender((): void => sheetRef.setInput('open', true), { injector: request.injector });

    return { overlayRef, sheetRef };
}

/**
 * Намерения закрыть шторку: её подложка и ручка, а также Escape, пойманный оверлеем. Директива
 * закрывает по ним панель тем же `close()`, что и нажатие снаружи у панели рядом с триггером.
 */
export function rtPopoverSheetDismissals(sheet: IRtPopoverSheetOpened): Observable<unknown> {
    return merge(
        outputToObservable(sheet.sheetRef.instance.dismissed),
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

/**
 * Закрывает шторку: фокус, оказавшийся внутри, возвращается на `returnFocusTo`, а сама шторка
 * уезжает вниз и снимается после перехода. Длительность читается из стиля панели шторки — её задаёт
 * токен `--rt-duration-base`, а при отключённых переходах она нулевая, и шторка снимается сразу.
 * Страховочный таймер равен этой длительности: событие окончания перехода не приходит, если вкладка
 * скрыта или переход прерван.
 */
export function rtClosePopoverSheet(sheet: IRtPopoverSheetOpened, returnFocusTo: HTMLElement | null): void {
    const overlayElement: HTMLElement = sheet.overlayRef.overlayElement;
    const active: Element | null = overlayElement.ownerDocument.activeElement;
    if (returnFocusTo !== null && active !== null && overlayElement.contains(active)) {
        returnFocusTo.focus();
    }
    const panel: HTMLElement | null = overlayElement.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-panel"]');
    // Окно берётся у документа шторки, а не из глобального объекта; без окна переход не измерить.
    const view: Window | null = overlayElement.ownerDocument.defaultView;
    const durationMs: number = panel === null || view === null ? 0 : longestDurationMs(view.getComputedStyle(panel).transitionDuration);
    if (panel === null || durationMs === 0) {
        sheet.overlayRef.dispose();
        return;
    }
    let disposed: boolean = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const listener: AbortController = new AbortController();
    const finish: () => void = (): void => {
        if (!disposed) {
            disposed = true;
            if (timer !== null) {
                clearTimeout(timer);
            }
            listener.abort();
            sheet.overlayRef.dispose();
        }
    };
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
    sheet.sheetRef.setInput('open', false);
}
