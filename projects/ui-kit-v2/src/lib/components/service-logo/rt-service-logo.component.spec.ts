import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { By } from '@angular/platform-browser';

import { RtIconComponent } from '../icon/rt-icon.component';

import { createRtFixture, hostClasses, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtServiceLogoComponent } from './rt-service-logo.component';
import { IRtServiceLogo } from './rt-service-logo.model';

/** Заглушка картинки: байты в адресе, сеть спеке не нужна. */
const PLACEHOLDER_SRC: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 32"/%3E';

const IMAGE: IRtServiceLogo.ImageItem = { src: PLACEHOLDER_SRC, label: 'Card network' };
const ICON: IRtServiceLogo.IconItem = { icon: 'wallet', label: 'Bank transfer' };

function setup(inputs: Readonly<Record<string, unknown>>): ComponentFixture<RtServiceLogoComponent> {
    return createRtFixture(RtServiceLogoComponent, inputs);
}

function plates(fixture: ComponentFixture<RtServiceLogoComponent>): HTMLElement[] {
    return qaAll(fixture, 'service-logo-plate').map((plate: DebugElement): HTMLElement => plate.nativeElement);
}

/** Ступень значка кита внутри круга. */
function iconSize(fixture: ComponentFixture<RtServiceLogoComponent>): string {
    return fixture.debugElement.query(By.directive(RtIconComponent)).componentInstance.size();
}

describe('RtServiceLogoComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup({ logos: [IMAGE] }))).toContain('rt-service-logo');
    });

    it('SC-UKV-864 — размер ставит модификатор круга и ступень значка, без размера рисуется md', (): void => {
        // Каждая сборка стенда сносит предыдущую, поэтому размер проверяется сразу за своей сборкой.
        const md: ComponentFixture<RtServiceLogoComponent> = setup({ logos: [IMAGE] });
        expect(hostClasses(md)).not.toContain('rt-service-logo--size-sm');
        expect(hostClasses(md)).not.toContain('rt-service-logo--size-lg');
        expect(plates(md)).toHaveLength(1);
        expect(plates(md)[0].querySelector('[qa-dataid="service-logo-image"]')).not.toBeNull();

        expect(iconSize(setup({ logos: [ICON] }))).toBe('xl');

        const sm: ComponentFixture<RtServiceLogoComponent> = setup({ logos: [ICON], size: 'sm' });
        expect(hostClasses(sm)).toContain('rt-service-logo--size-sm');
        expect(iconSize(sm)).toBe('md');

        const lg: ComponentFixture<RtServiceLogoComponent> = setup({ logos: [ICON], size: 'lg' });
        expect(hostClasses(lg)).toContain('rt-service-logo--size-lg');
        expect(iconSize(lg)).toBe('3xl');
    });

    it('SC-UKV-865 — знаки идут кругами подряд в порядке входа: позже в разметке — выше', (): void => {
        const fixture: ComponentFixture<RtServiceLogoComponent> = setup({
            logos: [IMAGE, { ...IMAGE, label: 'Second' }, { ...IMAGE, label: 'Third' }],
        });
        const drawn: HTMLElement[] = plates(fixture);

        expect(drawn.map((plate: HTMLElement): string | null => plate.getAttribute('data-label'))).toEqual([
            'Card network',
            'Second',
            'Third',
        ]);
        expect(drawn[0].nextElementSibling).toBe(drawn[1]);
        expect(drawn[1].nextElementSibling).toBe(drawn[2]);
    });

    it('SC-UKV-866 — знак значком рисует значок кита в том же круге и без картинки', (): void => {
        const fixture: ComponentFixture<RtServiceLogoComponent> = setup({ logos: [ICON] });
        const plate: HTMLElement = plates(fixture)[0];

        expect(plate.querySelector('img')).toBeNull();
        expect(fixture.debugElement.query(By.directive(RtIconComponent)).componentInstance.name()).toBe('wallet');
        expect(plate.contains(qa(fixture, 'service-logo-icon')?.nativeElement)).toBe(true);
    });

    it('SC-UKV-867 — каждый знак назван своей подписью, ряд читается списком', (): void => {
        const fixture: ComponentFixture<RtServiceLogoComponent> = setup({ logos: [IMAGE, ICON] });
        const host: HTMLElement = fixture.nativeElement;
        const drawn: HTMLElement[] = plates(fixture);

        expect(host.getAttribute('role')).toBe('list');
        expect(drawn.every((plate: HTMLElement): boolean => plate.getAttribute('role') === 'listitem')).toBe(true);

        const image: HTMLImageElement = qa(fixture, 'service-logo-image')?.nativeElement;
        expect(image.getAttribute('alt')).toBe('Card network');
        expect(image.getAttribute('src')).toBe(PLACEHOLDER_SRC);

        const icon: HTMLElement = qa(fixture, 'service-logo-icon')?.nativeElement;
        expect(icon.getAttribute('role')).toBe('img');
        expect(icon.getAttribute('aria-label')).toBe('Bank transfer');
    });
});
