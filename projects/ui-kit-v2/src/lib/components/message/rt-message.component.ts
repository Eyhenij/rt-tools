import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { IRtTag } from '../tag/rt-tag.model';

const BEM_BLOCK: string = 'rt-message';

/**
 * Alert / banner для уведомлений с 6 severities и default icon mapping.
 *
 * Использует `role="alert"` на корневом `<aside>` — screen reader озвучивает
 * содержимое сразу после маунта (полезно для inline-фидбэка форм типа
 * «Сохранено успешно» / «{{ assignError() }}»).
 *
 * Severity-палитра идентична `rt-tag` (`info` / `success` / `warning` / `danger` /
 * `secondary` / `neutral`); тип `IRtTag.Severity` переиспользуется напрямую, чтобы
 * не дублировать union. Цвета — через семантические `--rt-color-state-*` токены,
 * layout — через primitive `--rt-space-*` / `--rt-radius-*`. BEM-разметка через
 * директивы `rtBlock` / `rtElem` / `rtMod` из `@rt-tools/core`.
 *
 * Default icon по severity:
 * - `info` → `ico-info`
 * - `success` → `check`
 * - `warning` → `ico-warning`
 * - `danger` → `ico-error`
 * - `secondary` / `neutral` → `null` (icon не рендерится)
 *
 * Любой default можно переопределить через `[icon]="..."`, либо явно отключить
 * передачей `[icon]="null"` (override срабатывает только для truthy значений).
 */
@Component({
    selector: 'rt-message',
    templateUrl: './rt-message.component.html',
    styleUrl: './rt-message.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtMessageComponent {
    /** Default icon mapping для каждой severity. `null` — иконка не рендерится. */
    readonly #severityIconDefaults: Readonly<Record<IRtTag.Severity, IRtIcon.Name | null>> = {
        info: 'ico-info',
        success: 'check',
        warning: 'ico-warning',
        danger: 'ico-error',
        secondary: null,
        neutral: null,
    };

    /**
     * Финальное имя иконки: явный override через `[icon]` имеет приоритет; иначе —
     * default по severity. Чтобы скрыть иконку у severity, у которой есть default,
     * передайте пустую строку как `[icon]` — она будет falsy и не «победит» default.
     * Полное отключение делается через severity `secondary` / `neutral`.
     */
    protected readonly effectiveIcon: Signal<IRtIcon.Name | null> = computed((): IRtIcon.Name | null => {
        if (this.hideIcon()) {
            return null;
        }
        const override: IRtIcon.Name | null = this.icon();
        if (override) {
            return override;
        }
        return this.#severityIconDefaults[this.severity()];
    });

    /** Семантическая палитра. По умолчанию `info` (синий info-banner). */
    public readonly severity: InputSignal<IRtTag.Severity> = input<IRtTag.Severity>('info');

    /** Override default-icon. `null` — использовать default по severity. */
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Полностью скрыть иконку (даже если у severity есть default) — только текст. */
    public readonly hideIcon: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Рендерит close-button справа (rt-icon-button ghost sm). */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Эмиттится при клике на close-button (только если `closable=true`). */
    public readonly closed: OutputEmitterRef<void> = output<void>();

    protected onClose(): void {
        this.closed.emit();
    }
}
