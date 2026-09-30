import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Сетка витрины не прокручивает свою матрицу внутри себя.
 *
 * Прокручиваемая обёртка обрезает охват кадра по ширине окна, и обвязка снимков не раздвигает окно:
 * столбцы за краем уходили из снимка молча. Раскладку среда спеков не считает, поэтому проверяются
 * стили сетки, а то, что окно после этого растёт, закрывают кадры сетки скруглений из десяти
 * столбцов.
 */
describe('StoryGridComponent', () => {
    const styles: string = readFileSync(join(__dirname, 'story-grid.component.scss'), 'utf8');

    it('SC-UKV-490 — стили сетки на месте, и ни одно правило не прокручивает и не обрезает содержимое', () => {
        expect(styles).toContain('.app-story-grid {');
        expect(styles).toContain('&__table {');
        expect(styles).not.toMatch(/overflow(-x|-y|-inline|-block)?\s*:/);
    });
});
