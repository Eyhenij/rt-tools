import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation, WritableSignal } from '@angular/core';

const BEM_BLOCK: string = 'rt-tooltip';

/**
 * Презентационная панель tooltip'а. Рендерится директивой `[rtTooltip]` через
 * CDK `ComponentPortal` в overlay; текст выставляется императивно
 * (`ref.instance.text.set(...)`) — отдельного `input()` нет, т.к. компонент
 * создаётся вручную, а не в шаблоне.
 *
 * `ViewEncapsulation.None` — стили префиксованы `.rt-tooltip` (единообразно с
 * остальным common/ui). `role="tooltip"` — вспомогательный ярлык для AT.
 */
@Component({
    selector: 'rt-tooltip',
    template: '{{ text() }}',
    styleUrl: './rt-tooltip.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        role: 'tooltip',
    },
})
export class RtTooltipComponent {
    public readonly text: WritableSignal<string> = signal<string>('');
}
