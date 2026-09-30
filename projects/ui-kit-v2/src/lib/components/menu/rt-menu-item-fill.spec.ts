import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtMenuItemComponent } from './rt-menu-item.component';

/** Пункты меню строки, как у приложения: залитый значок кита, залитое имя Material и контурный. */
@Component({
    selector: 'rt-menu-item-fill-host',
    template: `
        <rt-menu-item label="Изменить" icon="pencil" [fill]="true" />
        <rt-menu-item label="Карточка" glyph="person" fill />
        <rt-menu-item label="Удалить" icon="trash" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuItemComponent],
})
class MenuItemFillHostComponent {}

function icons(fixture: ComponentFixture<MenuItemFillHostComponent>): RtIconComponent[] {
    return fixture.debugElement.queryAll(By.directive(RtIconComponent)).map((node) => node.componentInstance as RtIconComponent);
}

describe('RtMenuItemComponent — заливка значка', (): void => {
    it('пункт с fill передаёт заливку значку — и своему icon, и паре имени Material', (): void => {
        const fixture: ComponentFixture<MenuItemFillHostComponent> = createRtFixture(MenuItemFillHostComponent);

        expect(icons(fixture).map((icon: RtIconComponent): boolean => icon.fill())).toEqual([true, true, false]);
    });

    it('без fill значок остаётся контурным, как раньше', (): void => {
        const fixture: ComponentFixture<MenuItemFillHostComponent> = createRtFixture(MenuItemFillHostComponent);

        expect(icons(fixture)[2].fill()).toBe(false);
        expect(icons(fixture)[2].name()).toBe('trash');
    });
});
