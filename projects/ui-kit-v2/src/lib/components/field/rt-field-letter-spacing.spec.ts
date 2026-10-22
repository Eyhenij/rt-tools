import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Стили компонента по имени папки. */
function stylesOf(folder: string, file: string): string {
    return readFileSync(join(__dirname, '..', folder, file), 'utf8');
}

describe('ручки интервала и шрифта полей для набора оформления', (): void => {
    it.each<[string, string]>([
        ['input', 'rt-input.component.scss'],
        ['input-number', 'rt-input-number.component.scss'],
        ['select', 'rt-select.component.scss'],
        ['textarea', 'rt-textarea.component.scss'],
    ])('SC-UKV-1012 — значение %s берёт интервал из ручки, без неё normal', (folder: string, file: string): void => {
        expect(stylesOf(folder, file)).toContain('letter-spacing: var(--rt-input-letter-spacing, normal);');
    });

    it('SC-UKV-1012 — подпись поля берёт интервал из своей ручки, без неё normal', (): void => {
        expect(stylesOf('field', 'rt-field.component.scss')).toContain('letter-spacing: var(--rt-field-label-letter-spacing, normal);');
    });

    it('SC-UKV-1012 — значение «на странице» берёт размер из ручки пагинации, без неё размер поля', (): void => {
        expect(stylesOf('pagination', 'rt-pagination.component.scss')).toContain(
            'font-size: var(--rt-pagination-field-font-size, var(--rt-input-font-size));'
        );
    });
});
