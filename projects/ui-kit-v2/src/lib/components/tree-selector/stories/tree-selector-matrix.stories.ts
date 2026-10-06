import { Meta, StoryObj } from '@storybook/angular';

import { REVERT_CHANGED, TestRtTreeSelectorMatrixComponent } from './component/test-tree-selector-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Forms/TreeSelector',
    component: TestRtTreeSelectorMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTreeSelectorMatrixComponent>;

type TStory = StoryObj<TestRtTreeSelectorMatrixComponent>;

/** Прямая и подтверждаемая формы, «Применить» выключено — SC-UKV-680, SC-UKV-682. */
export const Form: TStory = { args: { part: 'form' } };

/** Поиск по каждому слову, группа целиком и пустой итог — SC-UKV-677, SC-UKV-678. */
export const Search: TStory = { args: { part: 'search' } };

/**
 * Иконочные кнопки, заголовок, откат, переключатель и контрол приложения — SC-UKV-684, SC-UKV-686,
 * SC-UKV-689, SC-UKV-690. Откат стоит парой: в одной ячейке черновик равен выбору и кнопка
 * выключена, в другой история снимает отметку с «Гостиницы Арарат», и кнопка включается.
 */
export const Controls: TStory = {
    args: { part: 'controls' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const rows: HTMLElement[] = Array.from(
            canvasElement.querySelectorAll<HTMLElement>(`[aria-label="${REVERT_CHANGED}"] [qa-dataid="tree-row"][data-value="ararat"]`)
        );
        if (rows.length === 0) {
            throw new Error(`Controls: в ячейке «${REVERT_CHANGED}» нет строки «ararat»`);
        }
        rows.forEach((row: HTMLElement): void => row.click());
        await new Promise<void>((done: () => void): number => requestAnimationFrame((): void => done()));
    },
};

/** Флажки, радио и режим без отметок. */
export const Mode: TStory = { args: { part: 'mode' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
