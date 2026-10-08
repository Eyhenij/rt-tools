import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtSelectComponent } from './rt-select.component';
import { IRtSelect } from './rt-select.model';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
    { label: 'Казань', value: 'kzn' },
];

/** Выбор «Минск» до открытия: подсветка должна встать на него. */
function setup(): ComponentFixture<RtSelectComponent<string>> {
    const fixture: ComponentFixture<RtSelectComponent<string>> = createRtFixture(RtSelectComponent<string>, { options: OPTIONS });

    fixture.componentInstance.writeValue('msq');
    fixture.detectChanges();

    return fixture;
}

function trigger(fixture: ComponentFixture<RtSelectComponent<string>>): HTMLButtonElement {
    return qa(fixture, 'select-trigger')?.nativeElement as HTMLButtonElement;
}

/** Опции живут в оверлее CDK — ищутся в документе. */
function activeLabel(): string | undefined {
    return document.querySelector<HTMLElement>('.rt-select__option--active')?.textContent?.trim();
}

describe('RtSelectComponent — подсветка выбранного при открытии', (): void => {
    it('SC-UKV-762 — открытый мышью список подсвечивает выбранную опцию', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

        trigger(fixture).click();
        fixture.detectChanges();

        expect(activeLabel()).toBe('Минск');
    });

    it('SC-UKV-762 — открытый стрелкой список подсвечивает выбранную опцию, и следующая стрелка идёт от неё', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

        trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();

        expect(activeLabel()).toBe('Минск');

        trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();

        expect(activeLabel()).toBe('Казань');
    });
});
