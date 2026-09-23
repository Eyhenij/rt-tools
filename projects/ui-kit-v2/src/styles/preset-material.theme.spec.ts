import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Материальный набор берёт цвет темы Material, если она есть на странице, и ступень своей шкалы —
 * если её нет. Спрашивается собранный файл: запасное значение и имя Material живут только в нём, а
 * сборка и линтер стилей молчат, если одно из них пропадёт.
 */

const PRIMITIVES: string = readFileSync(join(__dirname, '_primitives.scss'), 'utf8');
const PRESET: string = readFileSync(join(__dirname, '_preset-material.scss'), 'utf8');
const PRIMARY: string = 'var(--mat-sys-primary, var(--rt-mat-blue-100))';
const ERROR: string = 'var(--mat-sys-error, var(--rt-mat-red-100))';

/** Значение объявления с таким именем в тексте. */
function valueOf(css: string, name: string): string | undefined {
    const match: RegExpMatchArray | null = css.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm'));

    return match?.[1].trim().replace(/\s+/g, ' ');
}

describe('материальный набор и тема Material', () => {
    it.each([
        ['--rt-color-action-primary', PRIMARY],
        ['--rt-color-action-primary-hover', `color-mix(in srgb, ${PRIMARY} 90%, #000)`],
        ['--rt-color-action-primary-active', `color-mix(in srgb, ${PRIMARY} 80%, #000)`],
        ['--rt-color-action-primary-subtle', `color-mix(in srgb, ${PRIMARY} 8%, transparent)`],
        ['--rt-color-text-link', PRIMARY],
        ['--rt-color-state-info-bg', 'var(--mat-sys-primary-container, var(--rt-mat-blue-20))'],
        ['--rt-color-action-danger', ERROR],
        ['--rt-color-action-danger-hover', `color-mix(in srgb, ${ERROR} 90%, #000)`],
        ['--rt-color-state-danger-bg', 'var(--mat-sys-error-container, var(--rt-mat-red-10))'],
        ['--rt-color-bg-nav', 'var(--mat-sys-primary, var(--rt-mat-navy-100))'],
        ['--rt-color-bg-surface', 'var(--mat-sys-surface, var(--rt-mat-neutral-0))'],
        ['--rt-color-bg-inverse', 'var(--mat-sys-inverse-surface, var(--rt-mat-neutral-100))'],
        [
            '--rt-color-bg-surface-subtle-2',
            'var(--mat-form-field-filled-container-color, var(--mat-sys-surface-variant, var(--rt-mat-neutral-15)))',
        ],
    ])('SC-UKV-355: назначение %s читает тему Material со ступенью шкалы запасной', (name: string, value: string) => {
        expect(valueOf(PRESET, name)).toBe(value);
    });

    it('SC-UKV-355: шкала и базовый набор не знают имён Material — они живут только в материальном наборе', () => {
        const semantic: string = readFileSync(join(__dirname, '_semantic.scss'), 'utf8');
        const dark: string = readFileSync(join(__dirname, '_theme-dark.scss'), 'utf8');

        expect(PRIMITIVES).not.toContain('--mat-');
        expect(semantic).not.toContain('--mat-');
        expect(dark).not.toContain('--mat-');
    });
});
