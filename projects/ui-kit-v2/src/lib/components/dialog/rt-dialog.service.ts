import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { ComponentType, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injectable, Injector, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EMPTY, map, merge, mergeMap, Observable, Subject, take, takeUntil } from 'rxjs';

import { carryThemeScopeOfFocus, materialPresetClassesOfFocus } from '../../util/material-preset';
import { RtDialogRef } from './rt-dialog-ref';
import { RT_DIALOG_DATA } from './rt-dialog.tokens';

/**
 * Конфигурация открытия модалки через `RtDialogService.open()`.
 */
export interface IRtDialogConfig<TData = unknown> {
    /** Данные, доступные внутри модалки через `inject(RT_DIALOG_DATA)`. */
    data?: TData;

    /** Дополнительный CSS-класс для backdrop (поверх стандартного `rt-dialog-backdrop`). */
    backdropClass?: string | string[];

    /** Дополнительный CSS-класс для panel-обёртки overlay (поверх `rt-dialog-overlay`). */
    panelClass?: string | string[];

    /** Закрывать модалку по клику на backdrop. По дефолту `true`. */
    closeOnBackdropClick?: boolean;

    /** Закрывать модалку по ESC. По дефолту `true`. */
    closeOnEscape?: boolean;

    /** Держать Tab внутри модалки, пока она открыта. По дефолту `false` — как было. */
    trapFocus?: boolean;

    /** После закрытия вернуть фокус туда, где он стоял при открытии. По дефолту `false`. */
    restoreFocus?: boolean;

    /**
     * Куда поставить фокус при открытии: `'dialog'` — на рамку окна, `'first-tabbable'` — на первый
     * элемент, до которого доходит Tab. По дефолту `false` — фокус не трогается.
     */
    autoFocus?: TRtDialogAutoFocus;
}

/** Куда диалог ставит фокус при открытии; `false` — никуда. */
export type TRtDialogAutoFocus = 'dialog' | 'first-tabbable' | false;

/**
 * Фокус одного открытия: ловушка ставится после того, как содержимое прикреплено, а вернуть
 * фокус надо при уходе оверлея, поэтому поля пишутся по ходу открытия.
 */
interface IRtDialogFocusState {
    trap: FocusTrap | null;
    restoreTo: HTMLElement | null;
}

/**
 * Контекст одного открытия модалки — payload для per-open close-подписок в конструкторном
 * стриме. `dialogRef` сужен до используемых handler'ами членов (`RtDialogRef<T>` инвариантен
 * по `T`, целиком в generic-agnostic контекст не влезает).
 */
interface IRtDialogOpenContext {
    overlayRef: OverlayRef;
    dialogRef: {
        disableClose: Signal<boolean>;
        close: () => void;
    };
    closeOnBackdropClick: boolean;
    closeOnEscape: boolean;
    focus: IRtDialogFocusState;
}

/**
 * Программный API для открытия модалок поверх CDK Overlay.
 *
 * Устройство сервиса:
 * - `Overlay.position().global().centerHorizontally().centerVertically()` — центрирование.
 * - `scrollStrategies.block()` — фиксирует background-scroll.
 * - `hasBackdrop: true` + кастомный класс — затемнение.
 * - `ComponentPortal` + custom `Injector` подкидывает `RtDialogRef` + `RT_DIALOG_DATA` в DI
 *   контент-компонента.
 *
 * Альтернатива: legacy inline `<rt-dialog [visible]>` форма продолжает работать через
 * native `<dialog>.showModal()`. Новые экраны — на программный API.
 *
 * @example
 * \`\`\`ts
 * // открытие
 * private readonly dialogService = inject(RtDialogService);
 *
 * openConfirm(): void {
 *   const ref = this.dialogService.open<ConfirmDialogComponent, { question: string }, boolean>(
 *     ConfirmDialogComponent,
 *     { data: { question: "Удалить?" } }
 *   );
 *   ref.afterClosed().subscribe((confirmed) => {
 *     if (confirmed) this.delete();
 *   });
 * }
 *
 * // контент-компонент
 * @Component({
 *   selector: "rt-confirm-dialog",
 *   template: \`
 *     <rt-dialog size="sm">
 *       <rt-dialog-header [title]="data.question" />
 *       <div>Действие необратимо.</div>
 *       <rt-dialog-footer>
 *         <button rtButton (click)="close(false)">Отмена</button>
 *         <button rtButton theme="danger" (click)="close(true)">Удалить</button>
 *       </rt-dialog-footer>
 *     </rt-dialog>
 *   \`,
 * })
 * export class ConfirmDialogComponent {
 *   readonly data = inject(RT_DIALOG_DATA) as { question: string };
 *   readonly #ref = inject(RtDialogRef<boolean>);
 *   close(result: boolean): void { this.#ref.close(result); }
 * }
 * \`\`\`
 */
@Injectable({ providedIn: 'root' })
export class RtDialogService {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #injector: Injector = inject(Injector);
    readonly #document: Document = inject(DOCUMENT);
    readonly #focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);

    readonly #openSource: Subject<IRtDialogOpenContext> = new Subject<IRtDialogOpenContext>();

    constructor() {
        // Per-open close-подписки (backdrop / ESC) живут в одном постоянном
        // конструкторном стриме: open() эмитит контекст открытия, mergeMap
        // подписывает event-стримы конкретного OverlayRef. `detachments()`
        // терминирует внутренний поток при overlay.dispose() (дёргается из
        // RtDialogRef.close()). mergeMap, а не switchMap — одновременно может
        // быть открыто несколько модалок (стек).
        //
        // Внутри обоих handler'ов — runtime-guard через `dialogRef.disableClose()`:
        // если контент-компонент выставил `disableClose.set(true)` (например, на
        // время in-flight submit'а), ESC / backdrop НЕ закрывают overlay.
        // Программный `dialogRef.close(result)` гейтом не задет — он всегда работает.
        this.#openSource
            .pipe(
                mergeMap((openContext: IRtDialogOpenContext): Observable<() => void> => {
                    const backdropClose$: Observable<() => void> = openContext.closeOnBackdropClick
                        ? openContext.overlayRef.backdropClick().pipe(
                              map((): (() => void) => (): void => {
                                  if (openContext.dialogRef.disableClose()) {
                                      return;
                                  }
                                  openContext.dialogRef.close();
                              })
                          )
                        : EMPTY;
                    const escapeClose$: Observable<() => void> = openContext.closeOnEscape
                        ? openContext.overlayRef.keydownEvents().pipe(
                              map((event: KeyboardEvent): (() => void) => (): void => {
                                  if (event.key !== 'Escape') {
                                      return;
                                  }
                                  event.preventDefault();
                                  if (openContext.dialogRef.disableClose()) {
                                      return;
                                  }
                                  openContext.dialogRef.close();
                              })
                          )
                        : EMPTY;
                    // Уход оверлея снимает ловушку фокуса и возвращает фокус. Отдельно от закрывающих
                    // потоков: те обрываются тем же уходом и до него не доживают.
                    const releaseFocus$: Observable<() => void> = openContext.overlayRef.detachments().pipe(
                        take(1),
                        map((): (() => void) => (): void => this.#releaseFocus(openContext.focus))
                    );
                    return merge(merge(backdropClose$, escapeClose$).pipe(takeUntil(openContext.overlayRef.detachments())), releaseFocus$);
                }),
                takeUntilDestroyed()
            )
            .subscribe((handleCloseIntent: () => void): void => handleCloseIntent());
    }

    public open<TComponent, TData = unknown, TResult = unknown>(
        component: ComponentType<TComponent>,
        config?: IRtDialogConfig<TData>
    ): RtDialogRef<TResult> {
        const overlayRef: OverlayRef = this.#overlay.create({
            positionStrategy: this.#overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: this.#overlay.scrollStrategies.block(),
            hasBackdrop: true,
            backdropClass: config?.backdropClass ?? 'rt-dialog-backdrop',
            panelClass: [config?.panelClass ?? 'rt-dialog-overlay', materialPresetClassesOfFocus(this.#document)].flat(),
            disposeOnNavigation: true,
        });
        // До attach: содержимое диалога может забрать фокус, и кусок темы у кнопки будет потерян.
        carryThemeScopeOfFocus(overlayRef.overlayElement, this.#document);

        const dialogRef: RtDialogRef<TResult> = new RtDialogRef<TResult>(overlayRef);
        const focus: IRtDialogFocusState = {
            trap: null,
            restoreTo: config?.restoreFocus === true ? this.#focusedElement() : null,
        };

        // Сами close-подписки объявлены один раз в конструкторе — здесь только
        // эмит контекста открытия (см. #openSource-стрим).
        this.#openSource.next({
            overlayRef,
            dialogRef,
            focus,
            closeOnBackdropClick: config?.closeOnBackdropClick !== false,
            closeOnEscape: config?.closeOnEscape !== false,
        });

        const injector: Injector = Injector.create({
            parent: this.#injector,
            providers: [
                { provide: RtDialogRef, useValue: dialogRef },
                { provide: RT_DIALOG_DATA, useValue: config?.data ?? null },
            ],
        });

        const portal: ComponentPortal<TComponent> = new ComponentPortal<TComponent>(component, null, injector);
        overlayRef.attach(portal);
        this.#holdFocus(overlayRef.overlayElement, focus, config?.trapFocus === true, config?.autoFocus ?? false);

        return dialogRef;
    }

    /**
     * Ловушка и первый фокус ставятся после отрисовки содержимого: до неё в оверлее нет ни рамки,
     * ни кнопок, и ловушке не на что опереться.
     */
    #holdFocus(pane: HTMLElement, focus: IRtDialogFocusState, trapFocus: boolean, autoFocus: TRtDialogAutoFocus): void {
        if (!trapFocus && autoFocus === false) {
            return;
        }
        afterNextRender(
            (): void => {
                if (trapFocus) {
                    focus.trap = this.#focusTrapFactory.create(pane);
                }
                switch (autoFocus) {
                    case 'dialog':
                        pane.querySelector<HTMLElement>('[role="dialog"]')?.focus();
                        break;
                    case 'first-tabbable':
                        this.#focusFirstTabbable(pane, focus.trap);
                        break;
                    default:
                        break;
                }
            },
            { injector: this.#injector }
        );
    }

    /** Без ловушки первый элемент ищет временная ловушка: обход по Tab у неё уже есть. */
    #focusFirstTabbable(pane: HTMLElement, trap: FocusTrap | null): void {
        if (trap) {
            trap.focusFirstTabbableElement();
            return;
        }
        const lookup: FocusTrap = this.#focusTrapFactory.create(pane);
        lookup.focusFirstTabbableElement();
        lookup.destroy();
    }

    #releaseFocus(focus: IRtDialogFocusState): void {
        focus.trap?.destroy();
        focus.trap = null;
        if (focus.restoreTo?.isConnected) {
            focus.restoreTo.focus();
        }
    }

    #focusedElement(): HTMLElement | null {
        const active: Element | null = this.#document.activeElement;
        return active instanceof HTMLElement && active !== this.#document.body ? active : null;
    }
}
