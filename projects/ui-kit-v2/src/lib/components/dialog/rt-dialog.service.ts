import { ComponentType, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EMPTY, map, merge, mergeMap, Observable, Subject, takeUntil } from 'rxjs';

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
                    return merge(backdropClose$, escapeClose$).pipe(takeUntil(openContext.overlayRef.detachments()));
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
            panelClass: config?.panelClass ?? 'rt-dialog-overlay',
            disposeOnNavigation: true,
        });

        const dialogRef: RtDialogRef<TResult> = new RtDialogRef<TResult>(overlayRef);

        // Сами close-подписки объявлены один раз в конструкторе — здесь только
        // эмит контекста открытия (см. #openSource-стрим).
        this.#openSource.next({
            overlayRef,
            dialogRef,
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

        return dialogRef;
    }
}
