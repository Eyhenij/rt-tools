import { OverlayRef } from '@angular/cdk/overlay';
import { signal, WritableSignal } from '@angular/core';

import { Observable, Subject } from 'rxjs';

/**
 * Хэндл к программно открытой модалке (через `RtDialogService.open()`).
 *
 * Контент-компонент инжектит `RtDialogRef` и закрывает модалку через `.close(result?)`.
 * Родитель, открывший модалку, ждёт результата через `.afterClosed()`.
 *
 * Generic `<T>` — тип результата `close(result)`. Дефолт `unknown` — если результат
 * не нужен, оставляй generic пустым.
 *
 * @example
 * \`\`\`ts
 * // в контент-компоненте
 * private readonly dialogRef = inject(RtDialogRef);
 * close(): void { this.dialogRef.close({ confirmed: true }); }
 *
 * // в родителе
 * dialogService.open(MyDialogComponent).afterClosed().subscribe((result) => {...});
 * \`\`\`
 */
export class RtDialogRef<T = unknown> {
    /**
     * Runtime-флаг, блокирующий close() через ESC / backdrop click.
     *
     * Default `false`. Включай (`dialogRef.disableClose.set(true)`) на
     * время in-flight submit'а, чтобы юзер не потерял введённые в форму
     * данные на случайном ESC. После next/error subscribe ставь обратно
     * в `false`. Не влияет на программный `close(result)` — он всегда
     * закрывает overlay.
     *
     * Статические config-флаги `closeOnEscape` / `closeOnBackdropClick`
     * (см. `IRtDialogConfig`) определяют, подписан ли вообще handler на
     * соответствующее событие; `disableClose` — это runtime-override,
     * который гейтит dispatch внутри уже-подписанного handler'а.
     */
    public readonly disableClose: WritableSignal<boolean> = signal(false);

    readonly #overlayRef: OverlayRef;
    readonly #afterClosedSource: Subject<T | undefined> = new Subject<T | undefined>();

    constructor(overlayRef: OverlayRef) {
        this.#overlayRef = overlayRef;
    }

    /** Закрывает overlay; опционально передаёт результат подписчикам `afterClosed()`. */
    public close(result?: T): void {
        this.#overlayRef.dispose();
        this.#afterClosedSource.next(result);
        this.#afterClosedSource.complete();
    }

    /** Эмиттит один раз — результат `close(result)` — и завершается. */
    public afterClosed(): Observable<T | undefined> {
        return this.#afterClosedSource.asObservable();
    }
}
