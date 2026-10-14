import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as sass from 'sass';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtInputComponent } from '../input/rt-input.component';
import { RtFieldComponent } from './rt-field.component';

/**
 * Поле материального набора против поля Material. Положения jsdom не считает: здесь проверяются
 * собранные правила, по которым браузер ставит подпись, значение, рамку и значки, и разметка, которую
 * они читают. Замер в браузере — история Molecules/Forms/Field → Material.
 */

/** Собранный лист без переносов: селекторы и значения читаются одной строкой. */
function compiled(file: string): string {
    return sass.compile(join(__dirname, file)).css.replace(/\s+/g, ' ');
}

const FIELD: string = compiled('rt-field.component.scss') + compiled('rt-field-label-inside.scss');
const INPUT: string = compiled('../input/rt-input.component.scss');
const INPUT_LABEL: string = compiled('../input/rt-input-floating-label.scss');
const SELECT: string = ['rt-select.component.scss', 'rt-select-clear.scss', 'rt-select-floating-label.scss', 'rt-select-material.scss']
    .map((file: string): string => compiled(`../select/${file}`))
    .join(' ');
const NUMBER: string = compiled('../input-number/rt-input-number.component.scss');
const TEXTAREA: string = compiled('../textarea/rt-textarea.component.scss');
const PRESET: string = readFileSync(join(__dirname, '../../../styles/_preset-material.scss'), 'utf8').replace(/\s+/g, ' ');
const SEMANTIC: string = readFileSync(join(__dirname, '../../../styles/_semantic.scss'), 'utf8');

/** Тело первого правила, селектор которого содержит заданный кусок. */
function ruleBody(css: string, selectorPart: string): string {
    const at: number = css.indexOf(selectorPart);
    const open: number = css.indexOf('{', at);

    return at < 0 ? '' : css.slice(open + 1, css.indexOf('}', open));
}

@Component({
    selector: 'rt-field-material-metrics-host',
    template: `
        <rt-field label="Гостиница">
            <rt-input [formControl]="hotel" />
        </rt-field>
        <rt-input
            ariaLabel="Поиск"
            iconLeft="ico-search"
            iconLeftTooltip="Минимум 3 символа"
            [iconLeftAction]="true"
            [iconLeftDisabled]="true"
            [formControl]="search" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, ReactiveFormsModule],
})
class MetricsHostComponent {
    public readonly hotel: FormControl<string | null> = new FormControl<string | null>('', [Validators.required]);
    public readonly search: FormControl<string | null> = new FormControl<string | null>('оф');
}

describe('поле материального набора против поля Material', (): void => {
    it('SC-UKV-909 — подпись ложится внутрь и тогда, когда признак набора стоит на самом поле', (): void => {
        expect(FIELD).toContain(
            '.rt-field--label-inside:is(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material])'
        );
    });

    it('SC-UKV-909 — подпись на рамке и её разрыв действуют и при признаке набора на теге контрола', (): void => {
        const preset: string = ':is(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material])';

        expect(SELECT).toContain(`.rt-select--floating${preset}:not(.rt-select--appearance--fill)`);
        expect(SELECT).toContain(`.rt-select${preset} .rt-select__floating-label`);
        expect(INPUT_LABEL).toContain(`.rt-input--floating${preset}:not(.rt-input--appearance--fill`);
        expect(INPUT_LABEL).toContain(`.rt-input${preset} .rt-input__floating-label`);
        expect(`${SELECT} ${INPUT_LABEL} ${INPUT}`).not.toMatch(/:is\(\.rt-preset-material, \[data-preset=material\]\) \.rt-/);
    });

    it('SC-UKV-910 — залитое поле: значение под поднятой подписью, подпись в 16 px от края', (): void => {
        expect(FIELD).toContain('top: calc(var(--rt-input-height) / 2 - var(--rt-space-5))');
        expect(FIELD).toContain('padding-top: calc(var(--rt-input-height) / 2 - var(--rt-space-1) - var(--rt-input-fill-edge))');
        expect(FIELD).toContain('line-height: var(--rt-leading-normal)');
        expect(FIELD).toContain('--rt-field-floating-start: var(--rt-input-padding-x)');
        expect(INPUT_LABEL).toContain('top: calc(var(--rt-input-height) / 2 - var(--rt-space-5) - var(--rt-input-edge))');
    });

    it('SC-UKV-910 — у залитого поля только черта снизу, в фокусе вдвое толще', (): void => {
        expect(ruleBody(INPUT, '.rt-input--appearance--fill {')).toContain(
            'border-width: var(--rt-input-fill-edge) var(--rt-input-fill-edge) var(--rt-input-border-width)'
        );
        expect(ruleBody(INPUT, '.rt-input--appearance--fill:focus-within')).toContain('box-shadow: var(--rt-input-fill-focus-shadow)');
        expect(SELECT).toContain('box-shadow: var(--rt-input-fill-focus-shadow)');
        expect(PRESET).toContain('--rt-input-fill-edge: 0px;');
        expect(PRESET).toContain('--rt-input-fill-focus-shadow: inset 0 -1px 0 0 var(--rt-input-color-border-focus);');
    });

    it('SC-UKV-910 — залитое поле числа размечено так же, как залитое поле ввода', (): void => {
        const fill: string = ruleBody(NUMBER, '.rt-input-number--appearance--fill {');

        expect(fill).toContain('border-width: var(--rt-input-fill-edge) var(--rt-input-fill-edge) var(--rt-input-border-width)');
        expect(ruleBody(NUMBER, '.rt-input-number--appearance--fill:focus-within')).toContain(
            'box-shadow: var(--rt-input-fill-focus-shadow)'
        );
        expect(FIELD).toContain('.rt-input-number--appearance--fill .rt-input-number__field');
    });

    it('SC-UKV-910 — отказ под полем начинается от текста поля, вплотную к нему', (): void => {
        const body: string = ruleBody(FIELD, '[data-preset=material]) .rt-field__messages');

        expect(body).toContain('padding-inline: var(--rt-input-padding-x)');
        expect(body).toContain('margin-top: calc(-1 * var(--rt-field-gap))');
    });

    it('SC-UKV-911 — подсказка, значки и стрелка — цвета темы Material, каретка — цвета марки, значок 24 px', (): void => {
        expect(PRESET).toContain('--rt-input-color-text-placeholder: var(--mat-sys-on-surface-variant,');
        expect(PRESET).toContain('--rt-input-icon-color: var(--mat-sys-on-surface-variant,');
        expect(PRESET).toContain('--rt-input-caret-color: var(--rt-color-action-primary);');
        expect(PRESET).toContain('--rt-input-icon-size: var(--rt-size-6);');
        expect(INPUT).toContain('caret-color: var(--rt-input-caret-color)');
        expect(INPUT).toContain('--rt-icon-step-sm: var(--rt-input-icon-size)');
        expect(SELECT).toContain('--rt-icon-color-muted: var(--rt-input-icon-color)');
    });

    it('SC-UKV-911 — значок в 12 px от края поля и в 4 px от текста, подпись в покое — с начала текста', (): void => {
        const left: string = ruleBody(INPUT, '[data-preset=material]):has(> rt-icon.rt-input__icon-left) {');
        const right: string = ruleBody(INPUT, '[data-preset=material]):has(> rt-icon.rt-input__icon-right) {');

        expect(left).toContain('padding-left: calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-input-edge))');
        expect(right).toContain('padding-right: calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-input-edge))');
        expect(INPUT).toContain('margin-right: calc(var(--rt-space-1) - var(--rt-input-gap))');
        expect(INPUT).toContain('margin-left: calc(var(--rt-space-1) - var(--rt-input-gap))');
        expect(INPUT_LABEL).toContain('var(--rt-input-icon-size) + var(--rt-space-1)');
        expect(FIELD).toContain(
            '--rt-field-floating-rest-start: calc(var(--rt-space-2) + var(--rt-space-1) + var(--rt-input-icon-size) + var(--rt-space-1))'
        );
    });

    it('SC-UKV-912 — звёздочка стоит вплотную к подписи, зазор задаёт свойство', (): void => {
        const fixture: ComponentFixture<MetricsHostComponent> = createRtFixture(MetricsHostComponent);
        const label: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('.rt-field__label') as HTMLElement;

        expect(label.textContent).toBe('Гостиница*');
        expect(SEMANTIC).toContain('--rt-field-required-gap: var(--rt-space-1);');
        expect(PRESET).toContain('--rt-field-required-gap: 0px;');
    });

    it('SC-UKV-913 — кнопка-значок отключается своим входом, поле остаётся доступным', (): void => {
        const fixture: ComponentFixture<MetricsHostComponent> = createRtFixture(MetricsHostComponent);
        const host: HTMLElement = fixture.nativeElement as HTMLElement;
        const button: HTMLButtonElement = host.querySelector('[qa-dataid="input-icon-left-action"] button') as HTMLButtonElement;
        const field: HTMLInputElement = button.closest('rt-input')?.querySelector('input') as HTMLInputElement;

        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-label')).toBe('Минимум 3 символа');
        expect(field.disabled).toBe(false);
    });

    it('SC-UKV-914 — наименьшая ширина поля задаётся свойством, по умолчанию её нет', (): void => {
        expect(ruleBody(INPUT, '.rt-input {')).toContain('min-width: var(--rt-input-min-width)');
        expect(ruleBody(SELECT, '.rt-select {')).toContain('min-width: var(--rt-input-min-width)');
        expect(SEMANTIC).toContain('--rt-input-min-width: 0px;');
        expect(PRESET).not.toContain('--rt-input-min-width');
    });

    it('SC-UKV-916 — под набором текст начинается в 16 px от внешнего края, своим видом — от рамки', (): void => {
        expect(ruleBody(INPUT, '[data-preset=material]) {')).toContain(
            'padding-inline: calc(var(--rt-input-padding-x) - var(--rt-input-edge))'
        );
        expect(NUMBER).toContain('padding-inline: calc(var(--rt-input-padding-x) - var(--rt-input-number-edge))');
        expect(SELECT).toContain('padding-inline: calc(var(--rt-select-text-inset) - var(--rt-select-edge))');
        expect(TEXTAREA).toContain('padding-inline: calc(var(--rt-input-padding-x) - var(--rt-input-border-width))');
        expect(FIELD).toContain('--rt-field-floating-start: var(--rt-input-padding-x)');
    });

    it('SC-UKV-917 — отключённое поле под набором не тускнеет, а красит рамку и текст', (): void => {
        for (const css of [INPUT, NUMBER, SELECT, TEXTAREA]) {
            expect(css).toContain('opacity: var(--rt-input-disabled-field-opacity)');
            expect(css).toContain('border-color: var(--rt-input-color-border-disabled)');
            expect(css).toContain('color: var(--rt-input-color-text-disabled)');
        }

        expect(SEMANTIC).toContain('--rt-input-disabled-field-opacity: var(--rt-input-disabled-opacity);');
        expect(PRESET).toContain('--rt-input-disabled-field-opacity: 1;');
        expect(PRESET).toContain('--rt-input-color-border-disabled: var(--rt-color-action-disabled);');
        expect(PRESET).toContain('--rt-input-color-text-disabled: var(--rt-color-text-disabled);');
        expect(FIELD).toContain('color: var(--rt-input-color-placeholder-disabled)');
        expect(SELECT).toContain('--rt-icon-color-muted: var(--rt-input-color-placeholder-disabled)');
    });

    it('SC-UKV-915 — кнопка-значок в поле не выше поля без рамки', (): void => {
        const cap: string = 'var(--rt-input-height) - 2 * var(--rt-input-border-width)';

        expect(ruleBody(INPUT, '.rt-input__clear .rt-icon-button')).toContain(cap);
        expect(ruleBody(SELECT, '.rt-select__clear .rt-icon-button')).toContain(cap);
        expect(ruleBody(INPUT, '.rt-input--size--sm {')).toContain('--rt-input-height: var(--rt-input-height-sm)');
    });
});
