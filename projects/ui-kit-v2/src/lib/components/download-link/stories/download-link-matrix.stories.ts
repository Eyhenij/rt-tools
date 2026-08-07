import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtDownloadLinkMatrixComponent } from './component/test-download-link-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/DownloadLink',
    component: TestRtDownloadLinkMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDownloadLinkMatrixComponent>;

type Story = StoryObj<TestRtDownloadLinkMatrixComponent>;

export const Label: Story = { args: { part: 'label' } };

/** Признак ставится на хост, а стилизована `<button>` внутри шаблона — отсюда спуск до неё. */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Themes: Story = { args: { part: 'themes' } };
