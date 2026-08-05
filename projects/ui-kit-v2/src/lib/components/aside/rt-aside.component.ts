import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-aside';

/**
 * Варианты ширины side-sheet:
 * - `sm` — 400px (`--rt-aside-width-sm`)
 * - `md` — 540px (`--rt-aside-width-md`, дефолт)
 * - `lg` — 720px (`--rt-aside-width-lg`)
 */
export type IRtAsideSize = 'sm' | 'md' | 'lg';

/**
 * Раскладка контентной зоны side-sheet:
 * - `default` — контентная зона сама скроллится при overflow (штатный режим);
 * - `tabs` — контент — это `rt-tabs`: внешняя зона перестаёт быть скроллером,
 *   полоса вкладок прибита, скроллится только контент активной вкладки
 *   (`rt-tabs__content`).
 */
export type IRtAsideContentLayout = 'default' | 'tabs';

/**
 * Презентационный styled-frame для side-sheet.
 *
 * Видимость / backdrop / scroll-block / ESC / slide-in анимация — НЕ внутренняя
 * ответственность компонента. Это обеспечивает CDK Overlay через
 * `RtAsideService.open()`. rt-aside здесь — стилизованная "рамка" с size-вариантами
 * и тремя слотами: `rt-aside-header`, содержимое и `rt-aside-footer`.
 *
 * Содержимое лежит в одной зоне `.rt-aside__content` — она и держит инсет панели,
 * и прокручивается. Пока зоны не было, каждый корневой узел содержимого получал
 * инсет и прокрутку сам по себе: разделы делили высоту панели между собой, а
 * обводка фокуса поля срезалась краем такого мини-скроллера.
 *
 * Семантика — `role="complementary"` (mirror rt-dialog имеет `role="dialog"`,
 * aside — другая роль, side-sheet не обязательно блокирующий).
 *
 * `ViewEncapsulation.None` — стили префиксованы `.rt-aside`, чтобы соседние
 * rt-aside-header / rt-aside-footer работали с одним BEM-блоком без
 * cross-encapsulation хака.
 */
@Component({
    selector: 'rt-aside',
    templateUrl: './rt-aside.component.html',
    styleUrl: './rt-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective, ModDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideComponent {
    public readonly size: InputSignal<IRtAsideSize> = input<IRtAsideSize>('md');
    public readonly contentLayout: InputSignal<IRtAsideContentLayout> = input<IRtAsideContentLayout>('default');
    public readonly width: InputSignal<string | null> = input<string | null>(null);
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);
}
