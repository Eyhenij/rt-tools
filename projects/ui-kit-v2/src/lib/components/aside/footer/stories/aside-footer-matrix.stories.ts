import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideFooterMatrixComponent } from './component/test-aside-footer-matrix.component';

/**
 * Футер панели своих входов не имеет: он слот композиции, и показывать его можно только
 * разметкой с проекцией содержимого. Поэтому `Playground` у него нет — крутить нечего, — а
 * матрица перебирает наборы спроецированных зон.
 *
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем, при беглом
 * просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Aside/AsideFooter',
    component: TestRtAsideFooterMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAsideFooterMatrixComponent>;

type TStory = StoryObj<TestRtAsideFooterMatrixComponent>;

/** Зоны футера: только закрытие, обе зоны, только позитивный глагол, содержимое без атрибута. */
export const Zones: TStory = { args: { part: 'zones' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
