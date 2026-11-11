import { join } from 'node:path';

import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import * as sass from 'sass';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

@Component({
    selector: 'rt-tabs-arrows-host',
    template: `
        <rt-tabs activeId="a" [arrowLook]="look()">
            <ng-template rtTab="a" label="A">A</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsArrowsHostComponent {
    public readonly look: WritableSignal<IRtTabs.ArrowLook> = signal<IRtTabs.ArrowLook>('block');
}

/** Есть ли на обёртке полосы модификатор компактного вида — им включаются правила `--compact`. */
function compactWrapper(fixture: ComponentFixture<TabsArrowsHostComponent>): boolean {
    const wrapper: Element | null = (fixture.nativeElement as HTMLElement).querySelector('.rt-tabs__tab-list-wrapper');
    expect(wrapper).not.toBeNull();
    return wrapper?.classList.contains('rt-tabs__tab-list-wrapper--compact') ?? false;
}

/** Собранные стили файла одной строкой: правило ищется по началу селектора. */
function compiled(file: string): string {
    return sass.compile(join(__dirname, file)).css.replace(/\s+/g, ' ');
}

/** Тело правила по началу его селектора. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(selector);

    if (at < 0) {
        return '';
    }
    const open: number = at + selector.length;

    return css.slice(open, css.indexOf('}', open));
}

describe('RtTabsComponent — стрелки прокрутки и крестик меню «Ещё»', (): void => {
    it('SC-UKV-1209 — крестик строки меню скрыт и виден под указателем и фокусом', (): void => {
        const css: string = compiled('rt-tabs-more-menu.scss');

        expect(ruleBody(css, '.rt-tabs-more-menu__close {')).toContain('opacity: 0');
        expect(
            ruleBody(
                css,
                '.rt-tabs-more-menu__row:hover .rt-tabs-more-menu__close, .rt-tabs-more-menu__row:focus-within .rt-tabs-more-menu__close {'
            )
        ).toContain('opacity: 1');
    });

    it('SC-UKV-1218 — без наведения крестик строки меню виден всегда', (): void => {
        const css: string = compiled('rt-tabs-more-menu.scss');

        expect(ruleBody(css, '@media (hover: none) { .rt-tabs-more-menu__close {')).toContain('opacity: 1');
    });

    it('SC-UKV-1217 — без выбора вида компактного модификатора нет, arrowLook="compact" его ставит', (): void => {
        const fixture: ComponentFixture<TabsArrowsHostComponent> = createRtFixture(TabsArrowsHostComponent);
        fixture.detectChanges();
        expect(compactWrapper(fixture)).toBe(false);

        fixture.componentInstance.look.set('compact');
        fixture.detectChanges();

        expect(compactWrapper(fixture)).toBe(true);
    });

    it('SC-UKV-1217 — без выбора вида стрелка — квадрат во всю высоту полосы', (): void => {
        const css: string = compiled('rt-tabs-arrows.scss');
        const rest: string = ruleBody(css, '.rt-tabs__rest {');

        expect(rest).toContain('width: var(--rt-control-height-lg)');
        expect(rest).toContain('top: 0');
        expect(rest).toContain('bottom: 0');
        expect(ruleBody(css, '.rt-tabs__arrow {')).toContain('display: contents');
    });

    it('SC-UKV-1210 — стрелка — компактная кнопка со скруглением и цветами из свойств', (): void => {
        const body: string = ruleBody(compiled('rt-tabs-arrows.scss'), '.rt-tabs__tab-list-wrapper--compact .rt-tabs__arrow {');

        expect(body).toContain('width: var(--rt-tabs-arrow-size)');
        expect(body).toContain('height: var(--rt-tabs-arrow-size)');
        expect(body).toContain('border-radius: var(--rt-tabs-arrow-radius)');
        expect(body).toContain('background-color: var(--rt-tabs-arrow-bg)');
        expect(body).toContain('color: var(--rt-tabs-arrow-color)');
    });

    it('SC-UKV-1210 — размер кнопки по умолчанию — шаг 24', (): void => {
        expect(ruleBody(compiled('rt-tabs-arrows.scss'), '.rt-tabs {')).toContain('--rt-tabs-arrow-size: var(--rt-size-6)');
    });
});
