import { ChangeDetectionStrategy, Component, DestroyRef, DOCUMENT, inject, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

/** Класс корня, которым приложение включает тёмную тему без метки на `<html>`. */
const DARK_CLASS: string = 'rt-theme-dark';

/** Метка темы корня: её пишет переключатель витрины. */
const THEME_ATTRIBUTE: string = 'data-theme';

/**
 * Демонстрационная обёртка для витрины: тёмный узел набора Material внутри светлого куска на
 * странице, чью тёмную тему включил класс `rt-theme-dark`.
 *
 * Разметкой ячейки этот случай не показать: класс стоит на `<html>`, а метку темы, которую туда
 * пишет переключатель витрины, приложение с этим классом не ставит. Поэтому на время показа
 * обёртка ставит класс сама и снимает метку, а уходя возвращает обе.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-theme-scope-dark-set',
    templateUrl: './test-theme-scope-dark-set.component.html',
    styleUrl: './test-theme-scope-dark-set.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: 'app-theme-scope-dark-set',
        'data-story-root': '',
    },
})
export class TestRtThemeScopeDarkSetComponent {
    constructor() {
        const root: HTMLElement = inject(DOCUMENT).documentElement;
        const theme: string | null = root.getAttribute(THEME_ATTRIBUTE);
        const marked: boolean = root.classList.contains(DARK_CLASS);

        root.removeAttribute(THEME_ATTRIBUTE);
        root.classList.add(DARK_CLASS);

        inject(DestroyRef).onDestroy((): void => {
            root.classList.toggle(DARK_CLASS, marked);
            // Уход на соседнюю историю пишет её тему раньше, чем уничтожается эта: свежую метку
            // сохранённая здесь не заменяет.
            if (theme !== null && !root.hasAttribute(THEME_ATTRIBUTE)) {
                root.setAttribute(THEME_ATTRIBUTE, theme);
            }
        });
    }
}
