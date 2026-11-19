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
            panelClass: ['rt-popover-sheet-pane', ...materialPresetClassesOf(request.host)],
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
