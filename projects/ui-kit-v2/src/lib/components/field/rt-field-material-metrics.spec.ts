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
const INPUT: string = compiled('../input/rt-input.component.scss') + compiled('../input/rt-input-icons.scss');
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
    it('SC-UKV-950 — подпись ложится внутрь и тогда, когда признак набора стоит на самом поле', (): void => {
        expect(FIELD).toContain(
            '.rt-field--label-inside:is(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material])'
        );
    });

    it('SC-UKV-950 — подпись на рамке и её разрыв действуют и при признаке набора на теге контрола', (): void => {
        const preset: string = ':is(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material])';

        expect(SELECT).toContain(`.rt-select--floating${preset}:not(.rt-select--appearance--fill)`);
        expect(SELECT).toContain(`.rt-select${preset} .rt-select__floating-label`);
        expect(INPUT_LABEL).toContain(`.rt-input--floating${preset}:not(.rt-input--appearance--fill`);
        expect(INPUT_LABEL).toContain(`.rt-input${preset} .rt-input__floating-label`);
        expect(`${SELECT} ${INPUT_LABEL} ${INPUT}`).not.toMatch(/:is\(\.rt-preset-material, \[data-preset=material\]\) \.rt-/);
    });

    it('SC-UKV-951 — залитое поле: значение под поднятой подписью, подпись в 16 px от края', (): void => {
        expect(FIELD).toContain('top: calc(var(--rt-input-height) / 2 - var(--rt-space-5))');
        expect(FIELD).toContain('padding-top: calc(var(--rt-input-height) / 2 - var(--rt-space-1) - var(--rt-input-fill-edge))');
        expect(FIELD).toContain('line-height: var(--rt-leading-normal)');
        expect(FIELD).toContain('--rt-field-floating-start: var(--rt-input-padding-x)');
        expect(INPUT_LABEL).toContain('top: calc(var(--rt-input-height) / 2 - var(--rt-space-5) - var(--rt-input-edge))');
    });

    it('SC-UKV-951 — у залитого поля только черта снизу, в фокусе вдвое толще', (): void => {
        expect(ruleBody(INPUT, '.rt-input--appearance--fill {')).toContain(
            'border-width: var(--rt-input-fill-edge) var(--rt-input-fill-edge) var(--rt-input-border-width)'
        );
        expect(ruleBody(INPUT, '.rt-input--appearance--fill:focus-within')).toContain('box-shadow: var(--rt-input-fill-focus-shadow)');
        expect(SELECT).toContain('box-shadow: var(--rt-input-fill-focus-shadow)');
        expect(PRESET).toContain('--rt-input-fill-edge: 0px;');
        expect(PRESET).toContain('--rt-input-fill-focus-shadow: inset 0 -1px 0 0 var(--rt-input-color-border-focus);');
    });

    it('SC-UKV-951 — залитое поле числа размечено так же, как залитое поле ввода', (): void => {
        const fill: string = ruleBody(NUMBER, '.rt-input-number--appearance--fill {');

        expect(fill).toContain('border-width: var(--rt-input-fill-edge) var(--rt-input-fill-edge) var(--rt-input-border-width)');
        expect(ruleBody(NUMBER, '.rt-input-number--appearance--fill:focus-within')).toContain(
            'box-shadow: var(--rt-input-fill-focus-shadow)'
        );
        expect(FIELD).toContain('.rt-input-number--appearance--fill .rt-input-number__field');
    });

    it('SC-UKV-951 — отказ под полем начинается от текста поля, вплотную к нему', (): void => {
        const body: string = ruleBody(FIELD, '[data-preset=material]) .rt-field__messages');

        expect(body).toContain('padding-inline: var(--rt-input-padding-x)');
        expect(body).toContain('margin-top: calc(-1 * var(--rt-field-gap))');
    });

    it('SC-UKV-952 — подсказка, значки и стрелка — цвета темы Material, каретка — цвета марки, значок 24 px', (): void => {
        expect(PRESET).toContain('--rt-input-color-text-placeholder: var(--rt-sys-on-surface-variant,');
        expect(PRESET).toContain('--rt-input-icon-color: var(--rt-sys-on-surface-variant,');
        expect(PRESET).toContain('--rt-input-caret-color: var(--rt-color-action-primary);');
        expect(PRESET).toContain('--rt-input-icon-size: var(--rt-size-6);');
        expect(INPUT).toContain('caret-color: var(--rt-input-caret-color)');
        expect(INPUT).toContain('--rt-icon-step-sm: var(--rt-input-icon-size)');
        expect(SELECT).toContain('--rt-icon-color-muted: var(--rt-input-icon-color)');
    });

    it('SC-UKV-952 — значок в 12 px от края поля и в 4 px от текста, подпись в покое — с начала текста', (): void => {
        const left: string = ruleBody(INPUT, '[data-preset=material]):has(> .rt-input__icon-left) {');
        const right: string = ruleBody(INPUT, '[data-preset=material]):has(> .rt-input__icon-right) {');

        expect(left).toContain('padding-left: calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-input-edge))');
        expect(right).toContain('padding-right: calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-input-edge))');
        expect(INPUT).toContain('margin-right: calc(var(--rt-space-1) - var(--rt-input-gap))');
        expect(INPUT).toContain('margin-left: calc(var(--rt-space-1) - var(--rt-input-gap))');
        expect(INPUT_LABEL).toContain('var(--rt-input-icon-size) + var(--rt-space-1)');
        expect(FIELD).toContain(
            '--rt-field-floating-rest-start: calc(var(--rt-space-2) + var(--rt-space-1) + var(--rt-input-icon-size) + var(--rt-space-1))'
        );
    });

    it('SC-UKV-953 — звёздочка стоит вплотную к подписи, зазор задаёт свойство', (): void => {
        const fixture: ComponentFixture<MetricsHostComponent> = createRtFixture(MetricsHostComponent);
        const label: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('.rt-field__label') as HTMLElement;

        expect(label.textContent).toBe('Гостиница*');
        expect(SEMANTIC).toContain('--rt-field-required-gap: var(--rt-space-1);');
        expect(PRESET).toContain('--rt-field-required-gap: 0px;');
    });

    it('SC-UKV-954 — кнопка-значок отключается своим входом, поле остаётся доступным', (): void => {
        const fixture: ComponentFixture<MetricsHostComponent> = createRtFixture(MetricsHostComponent);
        const host: HTMLElement = fixture.nativeElement as HTMLElement;
        const button: HTMLButtonElement = host.querySelector('[qa-dataid="input-icon-left-action"] button') as HTMLButtonElement;
        const field: HTMLInputElement = button.closest('rt-input')?.querySelector('input') as HTMLInputElement;

        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-label')).toBe('Минимум 3 символа');
        expect(field.disabled).toBe(false);
    });

    it('SC-UKV-955 — наименьшая ширина поля задаётся свойством, по умолчанию её нет', (): void => {
        expect(ruleBody(INPUT, '.rt-input {')).toContain('min-width: var(--rt-input-min-width)');
        expect(ruleBody(SELECT, '.rt-select {')).toContain('min-width: var(--rt-input-min-width)');
        expect(SEMANTIC).toContain('--rt-input-min-width: 0px;');
        expect(PRESET).not.toContain('--rt-input-min-width');
    });

    it('SC-UKV-957 — под набором текст начинается в 16 px от внешнего края, своим видом — от рамки', (): void => {
        expect(ruleBody(INPUT, '[data-preset=material]) {')).toContain(
            'padding-inline: calc(var(--rt-input-padding-x) - var(--rt-input-edge))'
        );
        expect(NUMBER).toContain('padding-inline: calc(var(--rt-input-padding-x) - var(--rt-input-number-edge))');
        expect(SELECT).toContain('padding-inline: calc(var(--rt-select-text-inset) - var(--rt-select-edge))');
        expect(TEXTAREA).toContain('padding-inline: calc(var(--rt-input-padding-x) - var(--rt-textarea-edge))');
        expect(TEXTAREA).toContain('--rt-textarea-edge: var(--rt-input-border-width)');
        expect(FIELD).toContain('--rt-field-floating-start: var(--rt-input-padding-x)');
    });

    it('SC-UKV-958 — отключённое поле под набором не тускнеет, а красит рамку и текст', (): void => {
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

    it('SC-UKV-956 — под набором кнопка-значок в поле не выше поля без рамки, свой вид держит её размер', (): void => {
        const cap: string = 'var(--rt-input-height) - 2 * var(--rt-input-border-width)';

        expect(ruleBody(INPUT, '[data-preset=material]) .rt-input__clear .rt-icon-button')).toContain(cap);
        expect(ruleBody(INPUT, '[data-preset=material]) .rt-input__icon-left .rt-icon-button')).toContain(cap);
        expect(ruleBody(SELECT, '[data-preset=material]) .rt-select__clear .rt-icon-button')).toContain(cap);
        expect(INPUT).not.toMatch(/[{}] \.rt-input__(clear|icon-left|icon-right) \.rt-icon-button[ ,{]/);
        expect(SELECT).not.toMatch(/[{}] \.rt-select__clear \.rt-icon-button \{/);
        expect(ruleBody(INPUT, '.rt-input--size--sm {')).toContain('--rt-input-height: var(--rt-input-height-sm)');
    });

    it('SC-UKV-959 — под набором крестик очистки — крестик первого кита, своим видом — 32 px', (): void => {
        for (const css of [INPUT, SELECT]) {
            expect(css).toContain('--rt-icon-color-muted: var(--rt-input-clear-color)');
            expect(css).toContain('--rt-icon-step-sm: var(--rt-input-clear-icon-size)');
            expect(css).toContain('min(var(--rt-input-clear-size)');
        }

        expect(ruleBody(INPUT, '.rt-input__clear:last-child')).toContain('margin-inline-end: var(--rt-input-clear-offset-end)');
        expect(SEMANTIC).toContain('--rt-input-clear-size: var(--rt-control-height-sm);');
        expect(SEMANTIC).toContain('--rt-input-clear-offset-end: 0px;');
        expect(PRESET).toContain('--rt-input-clear-size: 19px;');
        expect(PRESET).toContain('--rt-input-clear-icon-size: var(--rt-size-3);');
        expect(PRESET).toContain('--rt-input-clear-color: var(--rt-mat-neutral-60);');
        expect(PRESET).toContain('--rt-input-clear-offset-end: calc(var(--rt-space-2) - var(--rt-space-1));');
    });

    it('SC-UKV-960 — под набором строка под полем — строка подсказки Material, своим видом — прежняя', (): void => {
        expect(ruleBody(FIELD, '.rt-field__messages {')).toContain('line-height: var(--rt-field-messages-line-height)');
        expect(ruleBody(FIELD, '.rt-field__messages {')).toContain('box-sizing: border-box');
        expect(FIELD).toContain('min-block-size: calc(1lh + var(--rt-field-messages-padding-top))');
        expect(FIELD).toContain(
            '.rt-field__messages--reserved, .rt-field__messages:has(> *) { padding-top: var(--rt-field-messages-padding-top)'
        );
        expect(SEMANTIC).toContain('--rt-field-messages-line-height: normal;');
        expect(SEMANTIC).toContain('--rt-field-messages-padding-top: 0px;');
        expect(PRESET).toContain('--rt-field-messages-line-height: var(--rt-size-4);');
        expect(PRESET).toContain('--rt-field-messages-padding-top: var(--rt-space-1);');
    });

    it('SC-UKV-961 — залитая область текста размечена, как залитое поле ввода', (): void => {
        const fill: string = ruleBody(TEXTAREA, '.rt-textarea--appearance--fill .rt-textarea__control {');

        expect(fill).toContain('border-bottom-color: var(--rt-color-field-fill-underline)');
        expect(fill).toContain('background-color: var(--rt-color-bg-surface-subtle-2)');
        expect(FIELD).toContain('.rt-textarea--appearance--fill');
        expect(
            ruleBody(
                TEXTAREA,
                'label-row):is(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material]) .rt-textarea--appearance--fill .rt-textarea__control {'
            )
        ).toContain('padding-bottom: calc(var(--rt-space-1) * 1.5 - var(--rt-input-border-width))');
    });

    it('SC-UKV-962 — под набором крестик лежит на сером круге первого кита, своим видом — без заливки', (): void => {
        for (const css of [INPUT, SELECT]) {
            expect(css).toContain('--rt-icon-button-bg-variant: var(--rt-input-clear-bg)');
            expect(css).toContain('--rt-icon-button-radius: var(--rt-input-clear-radius)');
        }

        expect(SEMANTIC).toContain('--rt-input-clear-bg: transparent;');
        expect(PRESET).toContain('--rt-input-clear-bg: var(--rt-mat-neutral-25);');
        expect(PRESET).toContain('--rt-input-clear-radius: var(--rt-radius-full);');
    });

    it('SC-UKV-963 — под набором кнопка-значок стоит на месте простого значка', (): void => {
        expect(INPUT).toContain(
            ':has(> .rt-input__icon-left) { padding-left: calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-input-edge))'
        );
        expect(INPUT).toContain('margin-inline: calc(-1 * var(--rt-input-icon-overhang))');
        expect(INPUT_LABEL).toContain(':has(> .rt-input__icon-left)');
    });

    it('SC-UKV-964 — под набором поле с крестиком: 4 px справа от текста, крестик в 4 px от текста и в 8 px от края', (): void => {
        expect(INPUT).toContain(
            '.rt-input--clearable:where(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material]):not(.rt-input--with-icon-right, .rt-input--readonly) { padding-right: calc(var(--rt-space-1) - var(--rt-input-edge))'
        );
        expect(INPUT).toContain('margin-inline-start: var(--rt-input-clear-offset-start)');
        expect(SEMANTIC).toContain('--rt-input-clear-offset-start: 0px;');
        expect(PRESET).toContain('--rt-input-clear-offset-start: calc(var(--rt-space-1) - var(--rt-input-gap));');
    });

    it('SC-UKV-965 — под набором отключённое залитое поле залито on-surface 4 %, своим видом — прежней заливкой', (): void => {
        expect(INPUT).toContain(
            '.rt-input--appearance--fill.rt-input--disabled { background-color: var(--rt-input-fill-color-bg-disabled)'
        );
        expect(SELECT).toContain(
            '.rt-select--disabled.rt-select--appearance--fill .rt-select__trigger { background-color: var(--rt-input-fill-color-bg-disabled)'
        );
        expect(NUMBER).toContain('background-color: var(--rt-input-fill-color-bg-disabled)');
        expect(TEXTAREA).toContain('background-color: var(--rt-input-fill-color-bg-disabled)');
        expect(SEMANTIC).toContain('--rt-input-fill-color-bg-disabled: var(--rt-color-bg-surface-subtle-2);');
        expect(PRESET).toContain(
            '--rt-input-fill-color-bg-disabled: color-mix(in srgb, var(--rt-sys-on-surface, var(--rt-mat-neutral-100)) 4%, transparent);'
        );
    });

    it('SC-UKV-966 — под набором выбор со своим шаблоном значения не выше поля Material', (): void => {
        expect(SELECT).toContain('.rt-select__label > .rt-select__option-content { vertical-align: top');
    });

    it('SC-UKV-967 — под набором залитая область текста в 4 строки — 124 px, как у Material', (): void => {
        expect(TEXTAREA).toContain('padding-bottom: calc(var(--rt-space-1) * 1.5 - var(--rt-input-border-width))');
        expect(TEXTAREA).toContain(
            '.rt-textarea:where(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material]) .rt-textarea__control { vertical-align: top'
        );
    });

    it('SC-UKV-979 — под набором залитое поле без подписи места под неё не держит', (): void => {
        const preset: string = ':is(.rt-preset-material *, [data-preset=material] *, .rt-preset-material, [data-preset=material])';

        expect(FIELD).toContain(
            `.rt-field--label-inside${preset}:has(.rt-field__label-row) :is(.rt-input--appearance--fill .rt-input__field`
        );
        expect(FIELD).toContain(
            `.rt-field--label-inside${preset}:has(.rt-field__label-row):not(.rt-field--filled, :focus-within) ::placeholder`
        );
        expect(TEXTAREA).toContain(
            'padding-top: calc(var(--rt-input-height) / 2 - var(--rt-space-6) / 2 - var(--rt-input-fill-edge)); ' +
                'padding-bottom: calc(var(--rt-input-height) / 2 - var(--rt-space-6) / 2 - var(--rt-input-border-width))'
        );
        expect(TEXTAREA).toContain(
            `.rt-field--label-inside:has(.rt-field__label-row)${preset} .rt-textarea--appearance--fill .rt-textarea__control`
        );
    });
});
