import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtMenuItemIconDirective } from './rt-menu-item-icon.directive';
import { RtMenuItemComponent } from './rt-menu-item.component';

/** Имя, которого в перечне кита нет и не будет: по форме его туда не взять. */
const NO_PAIR: string = 'no_such_glyph_for_test';

/** Пункты, как у приложения: свой значок, свой значок у опасного пункта и имя Material без пары. */
@Component({
    selector: 'rt-menu-item-icon-host',
    template: `
        <rt-menu-item label="Сделать активным" icon="ico-eye" glyph="done">
            <ng-template rtMenuItemIcon><svg data-own-icon viewBox="0 0 24 24"></svg></ng-template>
        </rt-menu-item>
        <rt-menu-item label="Удалить" [danger]="true">
            <ng-template rtMenuItemIcon><svg data-own-icon viewBox="0 0 24 24"></svg></ng-template>
        </rt-menu-item>
        <rt-menu-item label="Без пары" [glyph]="noPair" />
        <rt-menu-item label="С парой" glyph="done" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuItemComponent, RtMenuItemIconDirective],
})
class MenuItemIconHostComponent {
    public readonly noPair: string = NO_PAIR;
}

function items(fixture: ComponentFixture<MenuItemIconHostComponent>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('rt-menu-item'));
}

describe('RtMenuItemIconDirective', (): void => {
    let warn: jest.SpyInstance;

    beforeEach((): void => {
        warn = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
    });

    afterEach((): void => {
        warn.mockRestore();
    });

    it('свой значок встаёт на место значка пункта и сильнее icon и glyph', (): void => {
        const fixture: ComponentFixture<MenuItemIconHostComponent> = createRtFixture(MenuItemIconHostComponent);
        const own: HTMLElement = items(fixture)[0];
        const slot: Element | null = own.querySelector('[qa-dataid="menu-item-own-icon"]');

        expect(slot?.classList).toContain('rt-menu-item__icon');
        expect(slot?.classList).toContain('rt-menu-item__icon--own');
        expect(slot?.querySelector('[data-own-icon]')).not.toBeNull();
        expect(own.querySelector('rt-icon')).toBeNull();
    });

    it('свой значок стоит перед подписью и берёт тон опасного пункта с хоста', (): void => {
        const fixture: ComponentFixture<MenuItemIconHostComponent> = createRtFixture(MenuItemIconHostComponent);
        const danger: HTMLElement = items(fixture)[1];
        const children: Element[] = Array.from(danger.children);

        expect(danger.classList).toContain('rt-menu-item--danger');
        expect(children.map((child: Element): string | null => child.getAttribute('qa-dataid'))).toEqual([
            'menu-item-own-icon',
            'menu-item-label',
        ]);
    });

    it('имя Material с парой по-прежнему рисуется значком кита', (): void => {
        const fixture: ComponentFixture<MenuItemIconHostComponent> = createRtFixture(MenuItemIconHostComponent);

        expect(items(fixture)[3].querySelector('rt-icon')).not.toBeNull();
    });

    it('имя Material без пары и без своего значка предупреждает в консоли, остальные молчат', (): void => {
        createRtFixture(MenuItemIconHostComponent);

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain(NO_PAIR);
        expect(warn.mock.calls[0][0]).toContain('Без пары');
    });
});
