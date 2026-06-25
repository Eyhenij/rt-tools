import * as path from 'path';
import * as sass from 'sass';

/**
 * Build-time guarantees for the custom color-scheme mechanism:
 *   1. Δ0 — moving the accent tier onto the `--rt-color-{role}-{N}` indirection
 *      keeps every accent semantic token byte-for-byte identical (own palette).
 *   2. The `rt.color-scheme` Sass mixin emits a scoped `[data-rt-scheme]` block.
 *   3. Input validation rejects unknown roles / out-of-range tones.
 *   4. The teal case: a custom teal ramp drives `--rt-bg-accent-primary-solid` to teal.
 */

const STYLES_DIR: string = __dirname;

/** Frozen resolved (own-palette) values of every accent token BEFORE the indirection refactor. */
const BASELINE: Record<string, string> = {
    '--rt-bg-accent-primary-subtle': 'light-dark(#eaedfc, color-mix(in srgb, #4284d7 18%, #1c1b1e))',
    '--rt-bg-accent-primary-solid': '#4284d7',
    '--rt-bg-accent-primary-hover': 'light-dark(color-mix(in srgb, #4284d7 90%, #000), color-mix(in srgb, #4284d7 90%, #fff))',
    '--rt-bg-accent-primary-disabled': 'color-mix(in srgb, #4284d7 38%, transparent)',
    '--rt-bg-accent-success-subtle': 'light-dark(#e5f8f4, color-mix(in srgb, #01af8d 18%, #1c1b1e))',
    '--rt-bg-accent-success-solid': '#21b18e',
    '--rt-bg-accent-success-hover': 'light-dark(color-mix(in srgb, #21b18e 90%, #000), color-mix(in srgb, #21b18e 90%, #fff))',
    '--rt-bg-accent-success-disabled': 'color-mix(in srgb, #21b18e 38%, transparent)',
    '--rt-bg-accent-warning-subtle': 'light-dark(#e8cbbf, color-mix(in srgb, #ef7128 18%, #1c1b1e))',
    '--rt-bg-accent-warning-solid': '#ee7a34',
    '--rt-bg-accent-warning-hover': 'light-dark(color-mix(in srgb, #ee7a34 90%, #000), color-mix(in srgb, #ee7a34 90%, #fff))',
    '--rt-bg-accent-warning-disabled': 'color-mix(in srgb, #ee7a34 38%, transparent)',
    '--rt-bg-accent-danger-subtle': 'light-dark(#fdedee, color-mix(in srgb, #eb5055 18%, #1c1b1e))',
    '--rt-bg-accent-danger-solid': '#eb5055',
    '--rt-bg-accent-danger-hover': 'light-dark(color-mix(in srgb, #eb5055 90%, #000), color-mix(in srgb, #eb5055 90%, #fff))',
    '--rt-bg-accent-danger-disabled': 'color-mix(in srgb, #eb5055 38%, transparent)',
    '--rt-bg-accent-info-subtle': 'light-dark(#eaedfc, color-mix(in srgb, #4284d7 18%, #1c1b1e))',
    '--rt-bg-accent-info-solid': '#4284d7',
    '--rt-bg-accent-info-hover': 'light-dark(color-mix(in srgb, #4284d7 90%, #000), color-mix(in srgb, #4284d7 90%, #fff))',
    '--rt-bg-accent-info-disabled': 'color-mix(in srgb, #4284d7 38%, transparent)',
    '--rt-text-accent-brand': 'light-dark(#0d1c2b, #e8e8e8)',
    '--rt-text-accent-primary': 'light-dark(#4284d7, #6d96e8)',
    '--rt-text-accent-success': '#01af8d',
    '--rt-text-accent-success-soft': '#21b18e',
    '--rt-text-accent-warning': '#ef7128',
    '--rt-text-accent-warning-soft': '#ee7a34',
    '--rt-text-accent-danger': '#eb5055',
    '--rt-text-accent-danger-soft': '#e88487',
    '--rt-text-accent-info': '#4284d7',
    '--rt-text-accent-info-soft': '#4285f4',
    '--rt-icon-accent-brand': 'light-dark(#0d1c2b, #e8e8e8)',
    '--rt-icon-accent-primary': 'light-dark(#4284d7, #6d96e8)',
    '--rt-icon-accent-success': '#01af8d',
    '--rt-icon-accent-warning': '#ef7128',
    '--rt-icon-accent-danger': '#eb5055',
    '--rt-icon-accent-info': '#4284d7',
    '--rt-border-accent-primary': 'light-dark(#4284d7, #6d96e8)',
    '--rt-border-accent-success': '#01af8d',
    '--rt-border-accent-warning': '#ef7128',
    '--rt-border-accent-danger': '#eb5055',
    '--rt-border-accent-danger-soft': '#e88487',
    '--rt-border-accent-info': '#4284d7',
    '--rt-border-focus': 'light-dark(#b3ceef, #6d96e8)',
};

/** Resolve `var(--mat-sys-X, FALLBACK)` to its fallback (own-palette, no Material configured). */
function stripMat(input: string): string {
    let value: string = input;
    let index: number = value.indexOf('var(--mat-sys-');

    while (index >= 0) {
        let depth: number = 0;
        let j: number = index + 4;

        for (; j < value.length; j++) {
            if (value[j] === '(') {
                depth++;
            } else if (value[j] === ')') {
                if (depth === 0) {
                    break;
                }
                depth--;
            }
        }

        const inner: string = value.slice(index + 4, j);
        const comma: number = inner.indexOf(',');
        value = value.slice(0, index) + inner.slice(comma + 1).trim() + value.slice(j + 1);
        index = value.indexOf('var(--mat-sys-');
    }

    return value;
}

/** Collapse `light-dark(X, X)` to `X` (identical branches render the same in both modes). */
function normalize(input: string): string {
    let value: string = input.replace(/\s+/g, ' ').trim();
    let prev: string = '';

    while (value !== prev) {
        prev = value;
        value = value.replace(/light-dark\(\s*([^,()]+?)\s*,\s*\1\s*\)/g, '$1');
    }

    return value.replace(/\s+/g, ' ').trim();
}

/** Extract `--name: value;` declarations matching a name pattern from compiled CSS. */
function extractDeclarations(css: string, namePattern: string): Record<string, string> {
    const out: Record<string, string> = {};
    const re: RegExp = new RegExp(`(${namePattern}):\\s*([^;]+);`, 'g');
    let match: RegExpExecArray | null = re.exec(css);

    while (match !== null) {
        out[match[1]] = match[2].trim();
        match = re.exec(css);
    }

    return out;
}

function compileTokens(): string {
    return sass.compile(path.join(STYLES_DIR, 'tokens.scss')).css;
}

function compileWithMixin(body: string): sass.CompileResult {
    return sass.compileString(`@use 'main' as rt;\n${body}`, { loadPaths: [STYLES_DIR] });
}

describe('rt-tools color schemes', () => {
    describe('Δ0 regression — accent indirection keeps the own palette byte-for-byte', () => {
        it('every accent semantic token resolves to its pre-refactor value', () => {
            const css: string = compileTokens();
            const ramp: Record<string, string> = extractDeclarations(css, '--rt-color-(?:primary|info|success|warning|danger|brand)-\\d+');
            const semantic: Record<string, string> = extractDeclarations(
                css,
                '--rt-(?:bg|text|icon|border)-accent[\\w-]*|--rt-border-focus'
            );

            const resolveRamp: (value: string) => string = (value: string): string => {
                let resolved: string = value;
                let prev: string = '';

                while (resolved !== prev) {
                    prev = resolved;
                    for (const key of Object.keys(ramp)) {
                        resolved = resolved.split(`var(${key})`).join(stripMat(ramp[key]));
                    }
                }

                return normalize(stripMat(resolved));
            };

            for (const token of Object.keys(BASELINE)) {
                expect(semantic[token]).toBeDefined();
                expect(resolveRamp(semantic[token])).toBe(BASELINE[token]);
            }
        });
    });

    describe('Material hybrid — default honors --mat-sys-*, a scheme overrides it', () => {
        it('default ramp tones carry the --mat-sys-* fallback where the original token did', () => {
            const ramp: Record<string, string> = extractDeclarations(
                compileTokens(),
                '--rt-color-(?:primary|info|success|warning|danger|brand)-\\d+'
            );

            // tones that mapped to a Material system color carry the fallback (default honors Material)
            expect(ramp['--rt-color-primary-100']).toBe('var(--mat-sys-primary, #4284d7)');
            expect(ramp['--rt-color-primary-20']).toBe('var(--mat-sys-primary-container, #eaedfc)');
            expect(ramp['--rt-color-danger-100']).toBe('var(--mat-sys-error, #eb5055)');
            expect(ramp['--rt-color-brand-100']).toBe('var(--mat-sys-primary, #0d1c2b)');

            // roles with no Material mapping stay raw — and a scheme overriding ANY tone with a raw
            // value drops the fallback entirely, so the scheme wins over an active Material theme.
            expect(ramp['--rt-color-info-100']).toBe('#4284d7');
            expect(ramp['--rt-color-success-100']).toBe('#01af8d');
            expect(ramp['--rt-color-warning-100']).toBe('#ef7128');
        });
    });

    describe('dark mode — a scheme drives both modes via distinct ramp tones', () => {
        it('accent tokens pick tone-100 in light and tone-60 in dark (scheme controls each)', () => {
            const semantic: Record<string, string> = extractDeclarations(
                compileTokens(),
                '--rt-text-accent-primary|--rt-border-accent-primary|--rt-icon-accent-primary'
            );

            // light-dark(primary-100, primary-60): the kit fixes WHICH tone per mode; the scheme
            // supplies the VALUE of each tone → a scheme can set a different dark tone (tone-60) than light.
            for (const token of Object.keys(semantic)) {
                expect(semantic[token]).toContain('var(--rt-color-primary-100)');
                expect(semantic[token]).toContain('var(--rt-color-primary-60)');
                expect(semantic[token].indexOf('primary-100')).toBeLessThan(semantic[token].indexOf('primary-60'));
            }
        });
    });

    describe('rt.color-scheme mixin', () => {
        it('emits a scoped [data-rt-scheme] block with only raw role rows', () => {
            const css: string = compileWithMixin(
                "@include rt.color-scheme('teal', (primary: (20: #b3e3e1, 100: #008582), brand: (100: #008582)));"
            ).css;

            const block: string = css.slice(css.indexOf('[data-rt-scheme=teal]'));

            expect(block).toContain('[data-rt-scheme=teal]');
            expect(block).toContain('--rt-color-primary-100: #008582');
            expect(block).toContain('--rt-color-primary-20: #b3e3e1');
            expect(block).toContain('--rt-color-brand-100: #008582');
            // schemes never duplicate the semantic derivation layer
            expect(block).not.toContain('--rt-bg-accent-primary-solid:');
        });

        it('rejects an unknown role', () => {
            expect(() => compileWithMixin("@include rt.color-scheme('x', (foo: (100: #000000)));")).toThrow(/unknown role/i);
        });

        it('rejects an out-of-range tone', () => {
            expect(() => compileWithMixin("@include rt.color-scheme('x', (primary: (150: #000000)));")).toThrow(/integer 0–100/i);
        });

        it('rejects an empty role map', () => {
            expect(() => compileWithMixin("@include rt.color-scheme('x', ());")).toThrow(/non-empty map/i);
        });
    });

    describe('teal reference case', () => {
        it('a teal primary ramp recolors --rt-bg-accent-primary-solid to teal', () => {
            const css: string = compileWithMixin(
                "@include rt.color-scheme('teal', (primary: (20: #b3e3e1, 40: #5cb8b5, 60: #1a9d99, 100: #008582)));"
            ).css;

            const scheme: Record<string, string> = extractDeclarations(css, '--rt-color-primary-\\d+');
            // bg-accent-primary-solid === var(--rt-color-primary-100); under the teal scheme that is #008582
            expect(scheme['--rt-color-primary-100']).toBe('#008582');
            expect(normalize(stripMat(css.match(/--rt-bg-accent-primary-solid:\s*([^;]+);/)![1]))).toBe('var(--rt-color-primary-100)');
        });
    });
});
