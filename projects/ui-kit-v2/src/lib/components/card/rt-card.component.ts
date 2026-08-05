import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-card';

/**
 * Контейнер-карточка с опциональным header (текст ИЛИ projected slot) и footer
 * (projected slot). Default content проецируется в основную область. Поддерживает
 * clickable mode для card-as-button сценариев: при `clickable=true` корневой
 * `<article>` получает `role="button"`, `tabindex="0"` и эмиттит `cardClick`
 * MouseEvent на клик и Enter/Space с клавиатуры.
 *
 * Две стратегии header:
 * 1. Текстом через `header="..."` input — рендерит `<h3 class="rt-card__title">`.
 * 2. Произвольный контент через attribute-selector slot `[rtCardHeader]`.
 *
 * Footer — только через slot `[rtCardFooter]`. Пустые header/footer слоты
 * визуально скрываются через `:empty` CSS-селектор.
 *
 * Все цвета и размеры — через семантические `--rt-*` токены; BEM-разметка через
 * директивы `rtBlock` / `rtElem` / `rtMod` из `@rt-tools/core`.
 */
@Component({
    selector: 'rt-card',
    templateUrl: './rt-card.component.html',
    styleUrl: './rt-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtCardComponent {
    /** Заголовок-текст; если задан — рендерится `<h3 class="rt-card__title">`. */
    public readonly header: InputSignal<string | null> = input<string | null>(null);

    /** ARIA-label на корневом `<article>`. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Делает карточку интерактивной: `role="button"`, `tabindex="0"`, клавиатура. */
    public readonly clickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Эмиттит MouseEvent при клике (или Enter/Space) — только если `clickable=true`. */
    public readonly cardClick: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    protected onClick(event: MouseEvent): void {
        if (this.clickable()) {
            this.cardClick.emit(event);
        }
    }

    protected onKeyActivate(event: Event): void {
        if (!this.clickable()) {
            return;
        }
        event.preventDefault();
        this.cardClick.emit(event as unknown as MouseEvent);
    }
}
