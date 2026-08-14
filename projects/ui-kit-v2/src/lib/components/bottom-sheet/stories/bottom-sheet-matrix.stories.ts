import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBottomSheetMatrixComponent } from './component/test-bottom-sheet-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/BottomSheet',
    component: TestRtBottomSheetMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBottomSheetMatrixComponent>;

type Story = StoryObj<TestRtBottomSheetMatrixComponent>;

export const Open: Story = { args: { part: 'open' } };

export const Content: Story = { args: { part: 'content' } };

export const Themes: Story = { args: { part: 'themes' } };
