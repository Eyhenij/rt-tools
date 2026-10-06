import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Высота строки полей против высоты шрифта кита. Montserrat поднимается на 0,968 кегля над базовой
 * линией и опускается на 0,251 под неё: строка ниже 1,219 кегля режет хвосты «у», «р», «д» у
 * подписи, которая прячет лишнее ради многоточия.
 */
const MONTSERRAT_EXTENT: number = 0.968 + 0.251;

const STYLES: string = join(__dirname, '../../styles');

function declared(file: string, name: string): string {
    const match: RegExpExecArray | null = new RegExp(`${name}:\\s*([^;]+);`).exec(readFileSync(join(STYLES, file), 'utf8'));
    expect(match).not.toBeNull();

    return (match as RegExpExecArray)[1].trim();
}

describe('the field line height', () => {
    it('SC-UKV-687 — the field line box holds the font', () => {
        const reference: string = declared('_semantic.scss', '--rt-input-line-height');
        const step: RegExpExecArray | null = /^var\((--rt-leading-[a-z]+)\)$/.exec(reference);
        expect(step).not.toBeNull();

        const value: number = Number(declared('_primitives.scss', (step as RegExpExecArray)[1]));

        expect(value).toBeGreaterThanOrEqual(MONTSERRAT_EXTENT);
    });
});
