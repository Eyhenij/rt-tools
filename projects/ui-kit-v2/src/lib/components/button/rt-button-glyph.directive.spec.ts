import { ChangeDetectionStrategy, Component, Provider, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture } from '../../../testing/rt-kit-testing';
import { RT_ICON_GLYPH_STRATEGY } from '../icon';
import { RT_ICON_SPRITE_ID } from '../icon/rt-icon.const';
import { RtButtonDirective } from './rt-button.directive';

/** Кнопка с именем значка — в своём наборе и под материальным. */
@Component({
    selector: 'rt-button-glyph-host',
    template: `
        <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
        <button rtButton qa-dataid="base" label="Закрыть" [icon]="icon()"></button>
        <div data-preset="material">
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton qa-dataid="material" label="Закрыть" [icon]="icon()"></button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtButtonDirective],
})
class ButtonGlyphHostComponent {
    public readonly icon: WritableSignal<string | null> = signal<string | null>('close');
}

function setup(icon: string, providers: Provider[] = []): ComponentFixture<ButtonGlyphHostComponent> {
    const fixture: ComponentFixture<ButtonGlyphHostComponent> = createRtFixture(ButtonGlyphHostComponent, {}, { providers });
    fixture.componentInstance.icon.set(icon);
    fixture.detectChanges();
    return fixture;
}

function buttonOf(fixture: ComponentFixture<ButtonGlyphHostComponent>, anchor: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${anchor}"]`) as HTMLElement;
}

function hrefIn(button: HTMLElement): string | null {
    return button.querySelector('use')?.getAttribute('href') ?? null;
}

function glyphIn(button: HTMLElement): HTMLElement | null {
    return button.querySelector('.rt-button__glyph');
}

describe('RtButtonDirective — имя Material и материальный набор', (): void => {
    afterEach((): void => {
        document.getElementById(RT_ICON_SPRITE_ID)?.remove();
    });

    it('SC-UKV-553 — под материальным набором кнопка рисует материальный рисунок значка', (): void => {
        const fixture: ComponentFixture<ButtonGlyphHostComponent> = setup('close');

        expect(hrefIn(buttonOf(fixture, 'base'))).toBe('#rt-icon-close');
        expect(hrefIn(buttonOf(fixture, 'material'))).toBe('#rt-icon-material-close');
    });

    it('SC-UKV-554 — имя Material с парой рисуется парой из набора кита', (): void => {
        const fixture: ComponentFixture<ButtonGlyphHostComponent> = setup('arrow_back');

        expect(hrefIn(buttonOf(fixture, 'base'))).toBe('#rt-icon-arrow-left');
        expect(glyphIn(buttonOf(fixture, 'base'))).toBeNull();
    });

    it('SC-UKV-555 — имя Material без пары рисуется лигатурой шрифта', (): void => {
        const button: HTMLElement = buttonOf(setup('pets'), 'base');

        expect(button.querySelector('svg')).toBeNull();
        expect(glyphIn(button)?.textContent).toBe('pets');
        expect(classesOf(glyphIn(button) as HTMLElement)).toEqual(['rt-button__icon', 'rt-button__glyph']);
    });

    it('по стратегии font и имя с парой рисуется лигатурой', (): void => {
        const button: HTMLElement = buttonOf(setup('arrow_back', [{ provide: RT_ICON_GLYPH_STRATEGY, useValue: 'font' }]), 'base');

        expect(button.querySelector('svg')).toBeNull();
        expect(glyphIn(button)?.textContent).toBe('arrow_back');
    });

    it('SC-UKV-774 — по стратегии font имя кита, которое шрифт не нарисует, рисуется рисунком кита', (): void => {
        const button: HTMLElement = buttonOf(setup('ico-plus', [{ provide: RT_ICON_GLYPH_STRATEGY, useValue: 'font' }]), 'base');

        expect(glyphIn(button)).toBeNull();
        expect(hrefIn(button)).toBe('#rt-icon-ico-plus');
    });
});
