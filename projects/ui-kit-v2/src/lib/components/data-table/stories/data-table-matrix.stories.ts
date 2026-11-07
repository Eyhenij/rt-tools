import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotWidths } from '../../../../showcase/story-snapshot';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { IRtDataTable } from '../rt-data-table.model';
import { TestRtDataTableMatrixComponent } from './component/test-data-table-matrix.component';
import { ITestDataTableRow, TEST_DATA_TABLE_ICON_COLUMNS } from './component/test-data-table.rows';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов здесь нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 *
 * Оси полос прокрутки тут нет: их размер приходит с корня страницы, и ставит его список — у
 * таблицы самой такой оси не существует.
 */
export default {
    title: 'Organisms/Material Dynamic List/DataTable',
    // Тема первого кита на всю страницу: таблица первого кита рисуется как на его витрине.
    globals: { preset: 'first-kit-theme' },
    component: TestRtDataTableMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDataTableMatrixComponent>;

type TStory = StoryObj<TestRtDataTableMatrixComponent>;

/** Каждый вид колонки по разу: так видно, чем готовая ячейка рисует значение каждого вида. */
export const Columns: TStory = { args: { part: 'columns' } };

/** Пиксели ступеней размера значка ячейки — те, что видит человек. */
const ICON_PIXELS: Readonly<Record<IRtDataTable.IconSize, number>> = Object.freeze({ sm: 16, md: 20, lg: 24 });

/** Сколько шаг ждёт ячеек: таблица берёт колонки у службы настроек и рисует строки не сразу. */
const CELLS_WAIT_MS: number = 5000;

/** Ячейки таблицы, когда их не меньше, чем колонок, и у каждой есть значок с размером. */
async function drawnCells(root: HTMLElement, columns: number): Promise<HTMLElement[]> {
    const started: number = Date.now();
    for (;;) {
        const cells: HTMLElement[] = [...root.querySelectorAll<HTMLElement>('.rt-data-table-cell')];
        const drawn: boolean =
            cells.length >= columns &&
            cells.every((cell: HTMLElement): boolean => {
                const icon: HTMLElement | null = cell.querySelector<HTMLElement>('rt-icon, [qa-dataid="data-table-cell-glyph"]');

                return (icon?.getBoundingClientRect().width ?? 0) > 0;
            });
        if (drawn) {
            return cells;
        }
        if (Date.now() - started > CELLS_WAIT_MS) {
            throw new Error(`IconSizes: за ${CELLS_WAIT_MS} мс таблица не нарисовала ячейки со значками — их ${cells.length}`);
        }
        await new Promise((resolve: (value: unknown) => void): unknown => setTimeout(resolve, 50));
    }
}

/**
 * Размер значка ячейки задаёт колонка: без поля 24px, `sm` — 16px, `md` — 20px; значок набора и
 * глиф без пары в перечне — теми же ступенями. Шаг истории меряет каждый значок на странице: тест
 * ячейки видит только переданную ступень, а пиксели считает браузер.
 */
export const IconSizes: TStory = {
    args: { part: 'icons' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        const expected: number[] = TEST_DATA_TABLE_ICON_COLUMNS.map(
            (column: IRtDataTable.Column<ITestDataTableRow>): number => ICON_PIXELS[column.icon?.size ?? 'lg']
        );
        const cells: HTMLElement[] = await drawnCells(canvasElement, expected.length);
        const wrong: string[] = cells.flatMap((cell: HTMLElement, index: number): string[] => {
            const icon: HTMLElement | null = cell.querySelector<HTMLElement>('rt-icon, [qa-dataid="data-table-cell-glyph"]');
            const want: number = expected[index % expected.length];
            if (!icon) {
                return [`ячейка ${index}: без значка`];
            }
            const width: number = Math.round(icon.getBoundingClientRect().width);
            const height: number = Math.round(icon.getBoundingClientRect().height);

            return width === want && height === want ? [] : [`ячейка ${index}: ${width}×${height} вместо ${want}×${want}`];
        });
        if (wrong.length > 0) {
            throw new Error(`IconSizes: размер значков ячеек не тот — ${wrong.join('; ')}`);
        }
    },
};

export const Sort: TStory = { args: { part: 'sort' } };

/**
 * Строку отбора таблица рисует сама, по настройке колонок: колонка без отбора держит пустое
 * место, а заданное условие строк не сужает — набор уходит приложению целиком.
 */
export const Filters: TStory = { args: { part: 'filters' } };

/** Выбор многих даёт флажки и флажок страницы, выбор по одной — радиокнопки и шапку без флажка. */
export const Selection: TStory = { args: { part: 'selection' } };

/**
 * Полоса действий скрыта, пока строка не наведена: в неподвижном кадре наведение ставит аддон
 * витрины — признак стоит на ячейке, а правило со `:hover` написано на строке таблицы.
 */
export const Actions: TStory = {
    args: { part: 'actions' },
    parameters: { pseudo: storyPseudoParameters('.rt-data-table__row') },
};

export const Clickable: TStory = { args: { part: 'clickable' } };

export const Presets: TStory = { args: { part: 'presets' } };

/**
 * Кадр на окне 1100 px: при нём половины наборов уже узкие, а полоса страниц ещё считает себя
 * широкой — тулбар и полоса страниц вылезали из карточки темы на соседнюю.
 */
export const Themes: TStory = { args: { part: 'themes' }, parameters: storySnapshotWidths(1100) };
