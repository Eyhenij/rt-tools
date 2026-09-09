import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters, storyWidthAtLeast } from '../../../../showcase';
import { TestRtChatMatrixComponent } from './component/test-chat-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Переписка объявляет свой порог ширины сама — 1441 px, — поэтому у матриц есть второй кадр.
 */
export default {
    title: 'Organisms/Chat/Chat',
    component: TestRtChatMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtLeast(1441)] },
    },
} as Meta<TestRtChatMatrixComponent>;

type TStory = StoryObj<TestRtChatMatrixComponent>;

/** «Переписка не выбрана» и «переписка пустая» — разные состояния, и рядом это видно. */
export const Thread: TStory = { args: { part: 'thread' } };

/** Виды сообщения одной лентой: порознь не видно, что своё прижато вправо, а чужое влево. */
export const MessageKind: TStory = { args: { part: 'messageKind' }, parameters: { snapshot: { fullPage: true } } };

/** Все четыре состояния доставки своего сообщения. */
export const Status: TStory = { args: { part: 'status' }, parameters: { snapshot: { fullPage: true } } };

/**
 * Точка действий потребителя у реплики: без шаблона её нет вовсе, с шаблоном — у каждой реплики,
 * а признак гасит её там, где действий у потребителя нет.
 */
export const MessageActions: TStory = {
    args: { part: 'messageActions' },
    parameters: { pseudo: storyPseudoParameters('.rt-chat__message-row') },
};

export const Reply: TStory = { args: { part: 'reply' } };

export const Header: TStory = { args: { part: 'header' } };

export const Loading: TStory = { args: { part: 'loading' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
