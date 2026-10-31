import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideFooterMatrixComponent } from './component/test-aside-footer-matrix.component';

/**
 * Футер панели — слот композиции, и показывать его можно только разметкой с проекцией
 * содержимого. Поэтому `Playground` у него нет: кнопки подставляются разметкой, а не значением.
 * Матрицы перебирают наборы спроецированных зон и раскладки.
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

/** Раскладки футера: `between` и `start`. */
export const Layouts: TStory = { args: { part: 'layouts' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
