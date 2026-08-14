import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtLeast } from '../../../../showcase';
import { TestRtChatMatrixComponent } from './component/test-chat-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Переписка объявляет свой порог ширины сама — 1441 px, — поэтому у матриц есть второй кадр.
 */
export default {
    title: 'Components/Chat',
    component: TestRtChatMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtLeast(1441)] },
    },
} as Meta<TestRtChatMatrixComponent>;

type Story = StoryObj<TestRtChatMatrixComponent>;

/** «Переписка не выбрана» и «переписка пустая» — разные состояния, и рядом это видно. */
export const Thread: Story = { args: { part: 'thread' } };

/** Виды сообщения одной лентой: порознь не видно, что своё прижато вправо, а чужое влево. */
export const MessageKind: Story = { args: { part: 'messageKind' }, parameters: { snapshot: { fullPage: true } } };

/** Все четыре состояния доставки своего сообщения. */
export const Status: Story = { args: { part: 'status' }, parameters: { snapshot: { fullPage: true } } };

export const Reply: Story = { args: { part: 'reply' } };

export const Header: Story = { args: { part: 'header' } };

export const Loading: Story = { args: { part: 'loading' } };

export const Themes: Story = { args: { part: 'themes' } };
