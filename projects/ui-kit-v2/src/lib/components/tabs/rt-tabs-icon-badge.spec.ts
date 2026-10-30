import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';

/** Вкладки с залитой и контурной иконкой и с бейджем в обоих местах. */
@Component({
    selector: 'rt-tabs-icon-badge-host',
    template: `
        <rt-tabs headerOnly>
            <!-- Значки Material, которых нет среди имён кита: имя кита рисуется своим набором, а не шрифтом. -->
            <ng-template rtTab="glyph-filled" label="Избранное" glyph="grade" iconFill>Избранное</ng-template>
            <ng-template rtTab="name-filled" label="Метки" icon="bookmark" iconFill>Метки</ng-template>
            <ng-template rtTab="outlined" label="Скидки" glyph="sell">Скидки</ng-template>
            <ng-template rtTab="overlay" label="Роли" glyph="group" badgePosition="overlay" [badge]="12">Роли</ng-template>
            <ng-template rtTab="inline" label="Отели" glyph="hotel" [badge]="3">Отели</ng-template>
            <ng-template rtTab="overlay-no-icon" label="Права" badgePosition="overlay" [badge]="5">Права</ng-template>
            <ng-template rtTab="icon-only" glyph="grade" tooltip="Избранное" badgePosition="overlay" [badge]="3">Избранное</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class IconBadgeHostComponent {}

function tab(fixture: ComponentFixture<IconBadgeHostComponent>, id: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`[data-tabid="${id}"]`) as HTMLButtonElement;
}

/** Значок вкладки как компонент: вход `fill` читается у него самого. */
function icon(fixture: ComponentFixture<IconBadgeHostComponent>, id: string): RtIconComponent {
    const node: DebugElement = fixture.debugElement
        .queryAll(By.directive(RtIconComponent))
        .find((it: DebugElement): boolean => tab(fixture, id).contains(it.nativeElement as Node)) as DebugElement;
    return node.componentInstance as RtIconComponent;
}

describe('RtTabsComponent — заливка иконки и бейдж над иконкой', (): void => {
    it('SC-UKV-1082 — iconFill отдаёт иконке fill: значок Material рисуется залитым', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);

        expect(icon(fixture, 'glyph-filled').fill()).toBe(true);
        expect(tab(fixture, 'glyph-filled').querySelector('.rt-icon__glyph--filled')).not.toBeNull();
    });

    it('SC-UKV-1082 — iconFill доходит и до иконки по имени кита', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);

        expect(icon(fixture, 'name-filled').fill()).toBe(true);
    });

    it('SC-UKV-1082 — без iconFill иконка остаётся контурной', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);

        expect(tab(fixture, 'outlined').querySelector('.rt-icon__glyph')).not.toBeNull();
        expect(tab(fixture, 'outlined').querySelector('.rt-icon__glyph--filled')).toBeNull();
        expect(icon(fixture, 'outlined').fill()).toBe(false);
    });

    it('SC-UKV-1085 — overlay ставит бейдж над иконкой, а не после подписи', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);
        const badges: NodeListOf<HTMLElement> = tab(fixture, 'overlay').querySelectorAll<HTMLElement>('.rt-tab-item__badge');

        expect(badges.length).toBe(1);
        expect(badges[0].classList).toContain('rt-tab-item__badge--overlay');
        expect(badges[0].closest('.rt-tab-item__icon-box')).not.toBeNull();
        expect(badges[0].textContent?.trim()).toBe('12');
    });

    it('SC-UKV-1085 — без overlay бейдж стоит после подписи, как прежде', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);
        const badge: HTMLElement | null = tab(fixture, 'inline').querySelector<HTMLElement>('.rt-tab-item__badge');

        expect(badge).not.toBeNull();
        expect(badge?.classList).not.toContain('rt-tab-item__badge--overlay');
        expect(badge?.closest('.rt-tab-item__icon-box')).toBeNull();
    });

    it('SC-UKV-1085 — у вкладки без иконки overlay оставляет бейдж после подписи', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);
        const badge: HTMLElement | null = tab(fixture, 'overlay-no-icon').querySelector<HTMLElement>('.rt-tab-item__badge');

        expect(badge?.textContent?.trim()).toBe('5');
        expect(badge?.classList).not.toContain('rt-tab-item__badge--overlay');
    });

    it('SC-UKV-1085 — у вкладки без подписи нет пустой подписи: её зазор сдвигал значок с середины', (): void => {
        const fixture: ComponentFixture<IconBadgeHostComponent> = createRtFixture(IconBadgeHostComponent);

        expect(tab(fixture, 'icon-only').querySelector('.rt-tab-item__title')).toBeNull();
        expect(tab(fixture, 'icon-only').querySelector('.rt-tab-item__badge--overlay')?.textContent?.trim()).toBe('3');
        expect(tab(fixture, 'overlay').querySelector('.rt-tab-item__title')?.textContent?.trim()).toBe('Роли');
    });
});
