import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-dialog';

export type IRtDialogSize = 'sm' | 'md' | 'lg';

/**
 * Презентационный styled-frame для модалки поверх CDK Overlay.
 *
 * Видимость / backdrop / scroll-block / ESC / focus-trap — НЕ внутренняя
 * ответственность компонента. Это обеспечивает CDK Overlay через
 * `RtDialogService.open()`. rt-dialog здесь — стилизованная "рамка"
 * (padding-free контейнер) с size-вариантами + ng-content слотом.
 *
 * Композиция:
 * \`\`\`html
 * <rt-dialog size="md">
 *   <rt-dialog-header title="Создание записи" />
 *   <div style="padding: var(--rt-space-lg);">body...</div>
 *   <rt-dialog-footer>
 *     <button rtButton (click)="cancel()">Отмена</button>
 *     <button rtButton (click)="save()">Сохранить</button>
 *   </rt-dialog-footer>
 * </rt-dialog>
 * \`\`\`
 *
 * Открытие — через `RtDialogService.open(MyModalComponent, { data })` →
 * получаешь `RtDialogRef<T>` с `.close(result)` + `.afterClosed()`.
 *
 * `ViewEncapsulation.None` — стили префиксованы `.rt-dialog`, чтобы
 * rt-dialog-header / rt-dialog-footer subscriptions работали с одним
 * BEM-классом без cross-encapsulation хака.
 */
@Component({
    selector: 'rt-dialog',
    templateUrl: './rt-dialog.component.html',
    styleUrl: './rt-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ModDirective],
    host: {
        class: BEM_BLOCK,
        '[style.--rt-dialog-width]': 'width()',
    },
})
export class RtDialogComponent {
    /**
     * Размер модалки:
     * - `sm` — 460px (`--rt-dialog-width-sm`)
     * - `md` — 660px (`--rt-dialog-width-md`, дефолт)
     * - `lg` — 860px (`--rt-dialog-width-lg`)
     */
    public readonly size: InputSignal<IRtDialogSize> = input<IRtDialogSize>('md');

    /** Override ширины через CSS-property `--rt-dialog-width`. Имеет приоритет над `size`. */
    public readonly width: InputSignal<string | null> = input<string | null>(null);

    /** ARIA-label для dialog-обёртки (если нет видимого заголовка). */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);
}
