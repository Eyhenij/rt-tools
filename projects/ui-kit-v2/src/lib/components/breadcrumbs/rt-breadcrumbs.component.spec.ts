import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtBreadcrumbsComponent } from './rt-breadcrumbs.component';
import { rtBreadcrumbsFits, rtBreadcrumbsFold } from './rt-breadcrumbs.logic';
import { IRtBreadcrumbs } from './rt-breadcrumbs.model';

const CHAIN: readonly IRtBreadcrumbs.Crumb[] = [
    { label: 'Settings', link: '/settings' },
    { label: 'Villas', link: '/settings/villas' },
    { label: 'Sea View' },
];

const LONG_CHAIN: readonly IRtBreadcrumbs.Crumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Settings', link: '/settings' },
    { label: 'Villas', link: '/settings/villas' },
    { label: 'Sea View', link: '/settings/villas/7' },
    { label: 'Rates' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

@Component({
    selector: 'rt-breadcrumbs-heading-host',
    template: `
        <rt-breadcrumbs look="heading" [crumbs]="chain">
            <span qa-dataid="heading-tag">Draft</span>
        </rt-breadcrumbs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBreadcrumbsComponent],
})
class HeadingHostComponent {
    public readonly chain: readonly IRtBreadcrumbs.Crumb[] = CHAIN;
}

function setup(inputs: Readonly<Record<string, unknown>>, narrow: boolean = false): ComponentFixture<RtBreadcrumbsComponent> {
    return createRtFixture(RtBreadcrumbsComponent, inputs, {
        providers: [provideRouter([]), ...(narrow ? [{ provide: BreakpointsService, useClass: NarrowBreakpointsService }] : [])],
    });
}

function host(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function linkTexts(fixture: ComponentFixture<unknown>): string[] {
    return qaAll(fixture, 'breadcrumbs-link').map((link: { nativeElement: HTMLElement }): string => textOf(link.nativeElement));
}

describe('RtBreadcrumbsComponent', (): void => {
    it('SC-UKV-819 — предки — ссылки, текущее звено — текст с aria-current, между ними разделитель', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: CHAIN });

        expect(linkTexts(fixture)).toEqual(['Settings', 'Villas']);
        expect(
            qaAll(fixture, 'breadcrumbs-link').map((link: { nativeElement: HTMLElement }) => link.nativeElement.getAttribute('href'))
        ).toEqual(['/settings', '/settings/villas']);

        const current: HTMLElement = qa(fixture, 'breadcrumbs-current')?.nativeElement as HTMLElement;

        expect(current.tagName).toBe('SPAN');
        expect(textOf(current)).toBe('Sea View');
        expect(current.getAttribute('aria-current')).toBe('page');
        expect(host(fixture).querySelectorAll('.rt-breadcrumbs__separator')).toHaveLength(2);
        expect(textOf(host(fixture).querySelector('.rt-breadcrumbs__separator'))).toBe('/');
    });

    it('SC-UKV-819 — хост — ориентир навигации с именем из подписей кита', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: CHAIN });

        expect(host(fixture).getAttribute('role')).toBe('navigation');
        expect(host(fixture).getAttribute('aria-label')).toBe('Breadcrumb');
    });

    it('SC-UKV-820 — кнопка «назад» по просьбе ведёт к последнему предку и называет его', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: CHAIN, back: true });
        const back: HTMLElement = qa(fixture, 'breadcrumbs-back')?.nativeElement as HTMLElement;

        expect(back.getAttribute('href')).toBe('/settings/villas');
        expect(back.getAttribute('aria-label')).toBe('Back to Villas');
    });

    it('SC-UKV-820 — без просьбы и без предков кнопки «назад» нет', (): void => {
        expect(qa(setup({ crumbs: CHAIN }), 'breadcrumbs-back')).toBeNull();
        expect(qa(setup({ crumbs: [{ label: 'Home' }], back: true }), 'breadcrumbs-back')).toBeNull();
    });

    it('SC-UKV-821 — в виде заголовка текущее звено — заголовок строкой ниже, рядом проекция', (): void => {
        const fixture: ComponentFixture<HeadingHostComponent> = createRtFixture(
            HeadingHostComponent,
            {},
            { providers: [provideRouter([])] }
        );
        const title: HTMLElement = qa(fixture, 'breadcrumbs-current')?.nativeElement as HTMLElement;

        expect(title.tagName).toBe('H1');
        expect(textOf(title)).toBe('Sea View');
        expect(title.parentElement?.classList.contains('rt-breadcrumbs__heading')).toBe(true);
        expect(title.parentElement?.querySelector('[qa-dataid="heading-tag"]')).not.toBeNull();
        expect(linkTexts(fixture)).toEqual(['Settings', 'Villas']);
    });

    it('SC-UKV-822 — на узком экране середина длинного пути уходит в меню', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: LONG_CHAIN }, true);

        expect(linkTexts(fixture)).toEqual(['Home', 'Sea View']);
        expect(qa(fixture, 'breadcrumbs-fold')).not.toBeNull();
        expect(textOf(qa(fixture, 'breadcrumbs-current'))).toBe('Rates');
    });

    it('SC-UKV-822 — свёртка оставляет первого и последнего предка, середину отдаёт по порядку', (): void => {
        const ancestors: readonly IRtBreadcrumbs.Crumb[] = LONG_CHAIN.slice(0, -1);

        expect(rtBreadcrumbsFold(ancestors, true)).toEqual({
            head: [ancestors[0]],
            hidden: [ancestors[1], ancestors[2]],
            tail: [ancestors[3]],
        });
        expect(rtBreadcrumbsFold(ancestors, false).hidden).toEqual([]);
        expect(rtBreadcrumbsFold(ancestors.slice(0, 2), true).hidden).toEqual([]);
    });

    it('SC-UKV-822 — на широком экране свёртки нет', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: LONG_CHAIN });

        expect(linkTexts(fixture)).toEqual(['Home', 'Settings', 'Villas', 'Sea View']);
        expect(qa(fixture, 'breadcrumbs-fold')).toBeNull();
    });

    it('SC-UKV-823 — разделитель задаётся входом', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: CHAIN, separator: '›' });

        expect(textOf(host(fixture).querySelector('.rt-breadcrumbs__separator'))).toBe('›');
    });

    it('SC-UKV-824 — обрезанное текущее звено показывает подпись целиком в подсказке', (): void => {
        const fixture: ComponentFixture<RtBreadcrumbsComponent> = setup({ crumbs: CHAIN });
        const current: HTMLElement = qa(fixture, 'breadcrumbs-current')?.nativeElement as HTMLElement;

        expect(current.hasAttribute('rttooltipwhentruncated')).toBe(true);
    });
});

describe('rtBreadcrumbsFits', (): void => {
    it('SC-UKV-830 — раздел помещается рядом с длинным именем, урезанным до порога: звено сжимается', (): void => {
        expect(rtBreadcrumbsFits(400, 120, 600, 120)).toBe(true);
    });

    it('SC-UKV-830 — короткое имя меряется своей полной шириной, а не порогом', (): void => {
        expect(rtBreadcrumbsFits(400, 330, 60, 120)).toBe(true);
    });

    it('SC-UKV-830 — предки не помещаются и рядом с порогом: строка едет к концу', (): void => {
        expect(rtBreadcrumbsFits(400, 330, 600, 120)).toBe(false);
    });
});
