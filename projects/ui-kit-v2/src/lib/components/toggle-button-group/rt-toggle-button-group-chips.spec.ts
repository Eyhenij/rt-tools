import { ComponentFixture } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as sass from 'sass';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from './rt-toggle-button-group.component';

/**
 * Вид «чипы» и галочка. Положения jsdom не считает: здесь проверяются разметка и собранные правила,
 * по которым браузер рисует чип. Измерение в браузере — история Molecules/Forms/ToggleButtonGroup → Appearance.
 */

const OPTIONS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя', disabled: true },
    { value: 'month', label: 'Месяц' },
];

const CHIPS: string = sass.compile(join(__dirname, 'rt-toggle-button-group-chips.scss')).css.replace(/\s+/g, ' ');
const PRESET: string = readFileSync(join(__dirname, '../../../styles/_preset-material.scss'), 'utf8').replace(/\s+/g, ' ');

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtToggleButtonGroupComponent<string>> {
    return createRtFixture(RtToggleButtonGroupComponent<string>, { options: OPTIONS, value: 'day', ...inputs });
}

function host(fixture: ComponentFixture<RtToggleButtonGroupComponent<string>>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

/** У каких пунктов стоит галочка — по порядку пунктов. */
function checks(fixture: ComponentFixture<RtToggleButtonGroupComponent<string>>): boolean[] {
    return Array.from(host(fixture).querySelectorAll('.rt-toggle-button-group__button')).map(
        (node: Element): boolean => node.querySelector('.rt-toggle-button-group__check') !== null
    );
}

describe('RtToggleButtonGroupComponent — вид «чипы»', (): void => {
    it('SC-UKV-927 — вид «чипы» помечает хост, по умолчанию вид сегментов', (): void => {
        expect(host(setup()).classList.contains('rt-toggle-button-group--chips')).toBe(false);
        expect(host(setup({ appearance: 'chips' })).classList.contains('rt-toggle-button-group--chips')).toBe(true);
    });

    it('SC-UKV-927 — у чипов нет дорожки, просвет 8 px и обводка у каждого пункта', (): void => {
        expect(CHIPS).toContain('background-color: transparent; gap: var(--rt-space-2)');
        expect(CHIPS).toContain('--rt-toggle-chip-outline: inset 0 0 0 var(--rt-border-width-thin) var(--rt-toggle-chip-edge)');
        expect(CHIPS).toContain('box-shadow: var(--rt-toggle-chip-outline);');
    });

    it('SC-UKV-928 — галочка стоит только у выбранного и только со входом', (): void => {
        expect(checks(setup({ appearance: 'chips' }))).toEqual([false, false, false]);
        expect(checks(setup({ appearance: 'chips', checkmark: true }))).toEqual([true, false, false]);
    });

    it('SC-UKV-929 — под набором чип — фильтр-чип Material', (): void => {
        expect(CHIPS).toContain('padding-block: var(--rt-space-2); row-gap: var(--rt-space-4)');
        expect(CHIPS).toContain('height: 28px; padding: 0 calc(3 * var(--rt-space-1))');
        expect(CHIPS).toContain('letter-spacing: 0.1px');
        expect(CHIPS).toContain(
            'padding: 0 calc(3 * var(--rt-space-1)); font-size: var(--rt-text-sm); font-weight: var(--rt-font-weight-medium)'
        );
        expect(CHIPS).toContain('.rt-toggle-button-group__check { block-size: var(--rt-size-6); inline-size: var(--rt-size-6)');
        expect(PRESET).toContain('--rt-toggle-chip-color-border: var(--mat-sys-outline, var(--rt-mat-neutral-60));');
        expect(CHIPS).toContain(
            '.rt-toggle-button-group__button--active:not(:disabled) { --rt-toggle-chip-edge: transparent; ' +
                'color: var(--mat-sys-on-secondary-container, var(--rt-color-text-primary)); }'
        );
        expect(PRESET).toContain('--rt-toggle-chip-color-bg-selected: var(--mat-sys-secondary-container, var(--rt-mat-neutral-25));');
    });

    it('SC-UKV-931 — столбик чипов тянет пункты на ширину места, и растягивание не схлопывает их высоту', (): void => {
        expect(CHIPS).toContain(
            'rt-toggle-button-group.rt-toggle-button-group--chips.rt-toggle-button-group--column { display: flex; flex: 1 1 auto; }'
        );
        expect(CHIPS).toContain(
            'rt-toggle-button-group.rt-toggle-button-group--chips.rt-toggle-button-group--column .rt-toggle-button-group__button { flex: none; }'
        );
    });

    it('SC-UKV-930 — недоступный пункт бледнеет: чип всегда, сегмент только под набором', (): void => {
        expect(CHIPS).toContain(
            '--rt-toggle-chip-edge: color-mix(in srgb, currentcolor 32%, transparent); color: var(--rt-color-text-disabled)'
        );
        expect(CHIPS).toMatch(
            /rt-toggle-button-group:is\([^)]*rt-preset-material[^{]*:not\(\.rt-toggle-button-group--chips\)[^{]*__button:disabled \{ color: var\(--rt-color-text-disabled\)/
        );
    });
});
