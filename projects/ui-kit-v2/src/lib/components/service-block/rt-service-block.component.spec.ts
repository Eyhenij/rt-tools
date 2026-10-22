import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { By } from '@angular/platform-browser';

import { RtServiceLogoComponent } from '../service-logo/rt-service-logo.component';
import { IRtServiceLogo } from '../service-logo/rt-service-logo.model';

import { createRtFixture, hostClasses, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtServiceBlockComponent } from './rt-service-block.component';

/** Заглушка картинки: байты в адресе, сеть спеке не нужна. */
const PLACEHOLDER_SRC: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 32"/%3E';

const IMAGE: IRtServiceLogo.ImageItem = { src: PLACEHOLDER_SRC, label: 'Card network' };
const ICON: IRtServiceLogo.IconItem = { icon: 'wallet', label: 'Bank transfer' };

function setup(inputs: Readonly<Record<string, unknown>>): ComponentFixture<RtServiceBlockComponent> {
    return createRtFixture(RtServiceBlockComponent, inputs);
}

/** Экземпляр знака внутри блока. */
function logoOf(fixture: ComponentFixture<RtServiceBlockComponent>): RtServiceLogoComponent {
    return fixture.debugElement.query(By.directive(RtServiceLogoComponent)).componentInstance;
}

describe('RtServiceBlockComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup({ logos: [IMAGE], name: 'Card payments' }))).toContain('rt-service-block');
    });

    it('SC-UKV-904 — знак размера md стоит первым, за ним имя и описание', (): void => {
        const fixture: ComponentFixture<RtServiceBlockComponent> = setup({
            logos: [IMAGE],
            name: 'Card payments',
            description: 'Accepts cards',
        });
        const logo: HTMLElement = qa(fixture, 'service-block-logo')?.nativeElement;
        const name: HTMLElement = qa(fixture, 'service-block-name')?.nativeElement;
        const description: HTMLElement = qa(fixture, 'service-block-description')?.nativeElement;

        expect(logoOf(fixture).size()).toBe('md');
        expect(logo.nextElementSibling?.firstElementChild).toBe(name);
        expect(name.textContent?.trim()).toBe('Card payments');
        expect(name.nextElementSibling).toBe(description);
        expect(description.textContent?.trim()).toBe('Accepts cards');
    });

    it('SC-UKV-905 — несколько знаков доходят до ряда знака в заданном порядке', (): void => {
        const logos: readonly IRtServiceLogo.Item[] = [IMAGE, { ...IMAGE, label: 'Second' }, ICON];
        const fixture: ComponentFixture<RtServiceBlockComponent> = setup({ logos, name: 'Card payments' });
        const plates: string[] = qaAll(fixture, 'service-logo-plate').map(
            (plate: DebugElement): string => plate.nativeElement.getAttribute('data-label') ?? ''
        );

        expect(logoOf(fixture).logos()).toBe(logos);
        expect(plates).toEqual(['Card network', 'Second', 'Bank transfer']);
    });

    it('SC-UKV-906 — пустое описание не рисует строки описания', (): void => {
        const fixture: ComponentFixture<RtServiceBlockComponent> = setup({ logos: [IMAGE], name: 'Card payments', description: '' });

        expect(qa(fixture, 'service-block-name')?.nativeElement.textContent.trim()).toBe('Card payments');
        expect(qa(fixture, 'service-block-description')).toBeNull();
    });
});
