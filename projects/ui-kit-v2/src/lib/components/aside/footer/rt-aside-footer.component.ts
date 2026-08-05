import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-aside-footer';

/**
 * Footer-слот для композиции внутри `<rt-aside>`. Две зоны через именованные
 * слоты: `[asideDismiss]` (слева — «Закрыть», `appearance="text"`, всегда) и
 * `[asidePrimary]` (справа — единственный позитивный глагол: Сохранить /
 * Отправить / Опубликовать, если есть). Раскладка `justify-content:
 * space-between`. Доменные/деструктивные действия в футер не кладём — они
 * проецируются иконками в `<rt-aside-header>` слот `[asideActions]`.
 *
 * Только две именованные зоны — безатрибутный контент НЕ проецируется (контент
 * без `asideDismiss`/`asidePrimary` не отрендерится).
 *
 * `ViewEncapsulation.None` — для единообразия с rt-aside.
 *
 * @example
 * \`\`\`html
 * <rt-aside-footer>
 *   <button rtButton asideDismiss appearance="text" (click)="onClose()">Закрыть</button>
 *   <button rtButton asidePrimary theme="primary" (click)="save()">Сохранить</button>
 * </rt-aside-footer>
 * \`\`\`
 */
@Component({
    selector: 'rt-aside-footer',
    templateUrl: './rt-aside-footer.component.html',
    styleUrl: './rt-aside-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideFooterComponent {}
