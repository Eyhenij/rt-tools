import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { RtTabsControlDirective } from './rt-tabs-control.directive';

/** Контролы шапки объявляются шаблонами внутри вкладок — без обёртки директиве нечего захватывать. */
@Component({
    selector: 'rt-tabs-control-host',
    template: `
        <rt-tabs>
            <ng-template rtTabsControl="left">
                <button qa-dataid="control-back" type="button">Назад</button>
            </ng-template>
            <ng-template rtTabsControl>
                <button qa-dataid="control-add" type="button">Добавить</button>
            </ng-template>
            <ng-template rtTab="main" label="Основное">Содержимое основного</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective, RtTabsControlDirective],
})
class TabsControlHostComponent {}

function setup(): ComponentFixture<TabsControlHostComponent> {
    return createRtFixture(TabsControlHostComponent);
}

/** Сторона читается по модификатору блока контролов, а не по порядку узлов в разметке. */
function sideOf(fixture: ComponentFixture<TabsControlHostComponent>, id: string): string | null {
    const control: HTMLElement | undefined = qa(fixture, id)?.nativeElement as HTMLElement | undefined;
    const slot: HTMLElement | null | undefined = control?.closest('.rt-tabs__controls');

    if (!slot) {
        return null;
    }

    return slot.classList.contains('rt-tabs__controls--before') ? 'left' : 'right';
}

describe('RtTabsControlDirective', (): void => {
    it('контрол уезжает в ту сторону, которую назвали', (): void => {
        expect(sideOf(setup(), 'control-back')).toBe('left');
    });

    it('без названной стороны контрол становится справа', (): void => {
        // Умолчание объявлено входом, и на глаз оно неотличимо от «стороны не задали вовсе».
        expect(sideOf(setup(), 'control-add')).toBe('right');
    });

    it('контролы живут в шапке рядом с полосой вкладок, а не внутри содержимого', (): void => {
        const fixture: ComponentFixture<TabsControlHostComponent> = setup();
        const panel: HTMLElement | undefined = qa(fixture, 'tabs-panel')?.nativeElement as HTMLElement | undefined;

        expect(el(fixture, '.rt-tabs__header')).not.toBeNull();
        expect(panel?.contains(qa(fixture, 'control-add')?.nativeElement as HTMLElement)).toBe(false);
    });
});
