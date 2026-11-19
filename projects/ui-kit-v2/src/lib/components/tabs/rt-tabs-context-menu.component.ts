import { BooleanInput } from '@angular/cdk/coercion';
import { CdkConnectedOverlay, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    InputSignalWithTransform,
    Signal,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject, switchMap } from 'rxjs';

import { BlockDirective } from '@rt-tools/core';

import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { IRtPopoverSheetOpened, rtOpenPopoverSheet, rtPopoverSheetDismissals } from '@rt-tools/ui-kit-v2/popover';

import { RtTabDirective } from './rt-tab.directive';
import { RtTabsMenuKeysDirective } from './rt-tabs-menu-keys.directive';
import { IRtTabs } from './rt-tabs.model';

const BEM_BLOCK: string = 'rt-tabs-context-menu';

/** Открытое меню: точка нажатия, разметка приложения и вкладка. */
interface IRtTabsContextMenuState {
    readonly point: { readonly x: number; readonly y: number };
    readonly template: TemplateRef<IRtTabs.ContextMenuContext>;
    readonly context: IRtTabs.ContextMenuContext;
}

/**
 * Меню вкладки по правой кнопке. Набор вкладок держит приложение, поэтому и пункты объявляет оно:
 * здесь только место у точки нажатия, панель и закрытие. Нажатие на любой пункт закрывает меню.
 * Вкладка без шаблона оставляет меню браузера.
 */
@Component({
    selector: 'rt-tabs-context-menu',
    templateUrl: './rt-tabs-context-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [CdkConnectedOverlay, NgTemplateOutlet, RtTabsMenuKeysDirective, BlockDirective],
    host: { class: BEM_BLOCK },
})
export class RtTabsContextMenuComponent {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
    readonly #injector: Injector = inject(Injector);
    readonly #narrow: Signal<boolean> = inject(BreakpointsService).viewportNarrow;
    readonly #sheetOpenedSource: Subject<IRtPopoverSheetOpened> = new Subject<IRtPopoverSheetOpened>();

    /** Оверлей нижней шторки, пока меню открыто в ней. */
    #sheetOverlayRef: OverlayRef | null = null;

    protected readonly state: WritableSignal<IRtTabsContextMenuState | null> = signal<IRtTabsContextMenuState | null>(null);

    protected readonly panelTpl: Signal<TemplateRef<unknown>> = viewChild.required<TemplateRef<unknown>>('panelTpl');

    /** Меню откроется (или открыто) в нижней шторке: режим включён и экран узкий. */
    protected readonly inSheet: Signal<boolean> = computed((): boolean => this.sheet() && this.#narrow());

    /** На телефоне меню вкладки открывается в нижней шторке; `false` оставляет его у точки нажатия. */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    constructor() {
        // Шторка создаётся на каждое открытие: её подложка, ручка и Escape закрывают меню.
        this.#sheetOpenedSource
            .pipe(
                switchMap((sheet: IRtPopoverSheetOpened): Observable<unknown> => rtPopoverSheetDismissals(sheet)),
                takeUntilDestroyed(inject(DestroyRef))
            )
            .subscribe((): void => this.close());
        inject(DestroyRef).onDestroy((): void => this.#closeSheet());
    }

    public open(event: MouseEvent, tab: RtTabDirective): void {
        const template: TemplateRef<IRtTabs.ContextMenuContext> | null = tab.contextMenu();
        if (template === null) {
            return;
        }
        event.preventDefault();
        const state: IRtTabsContextMenuState = {
            template,
            point: RtTabsContextMenuComponent.pointOf(event),
            context: { $implicit: tab.id() },
        };
        this.state.set(state);
        if (this.inSheet()) {
            this.#openSheet(state, tab.label());
        }
    }

    /** Клавиша меню и Shift+F10 шлют событие без точки: меню встаёт под вкладкой. */
    public static pointOf(event: MouseEvent): { readonly x: number; readonly y: number } {
        if (event.clientX === 0 && event.clientY === 0 && event.target instanceof Element) {
            const box: DOMRect = event.target.getBoundingClientRect();
            return { x: box.left, y: box.bottom };
        }
        return { x: event.clientX, y: event.clientY };
    }

    protected close(): void {
        this.state.set(null);
        this.#closeSheet();
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    #openSheet(state: IRtTabsContextMenuState, title: string): void {
        this.#closeSheet();
        const sheet: IRtPopoverSheetOpened = rtOpenPopoverSheet({
            overlay: this.#overlay,
            host: this.#host.nativeElement,
            viewContainerRef: this.#viewContainerRef,
            injector: this.#injector,
            template: this.panelTpl(),
            context: state,
            title,
        });
        this.#sheetOverlayRef = sheet.overlayRef;
        this.#sheetOpenedSource.next(sheet);
    }

    #closeSheet(): void {
        this.#sheetOverlayRef?.dispose();
        this.#sheetOverlayRef = null;
    }
}
