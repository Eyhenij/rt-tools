import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtDownloadLinkMatrixComponent } from './component/test-download-link-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Buttons/DownloadLink',
    component: TestRtDownloadLinkMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDownloadLinkMatrixComponent>;

type TStory = StoryObj<TestRtDownloadLinkMatrixComponent>;

export const Label: TStory = { args: { part: 'label' } };

/** Признак ставится на хост, а стилизована `<button>` внутри шаблона — отсюда спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
