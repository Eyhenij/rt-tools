import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPopoverMatrixComponent } from './component/test-popover-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Панели здесь открыты все сразу: обёртка держит их в режиме `manual` и открывает вызовом.
 * Жестом это не показать — щелчок по второму триггеру закрыл бы первую панель.
 */
export default {
    title: 'Components/Popover',
    component: TestRtPopoverMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtPopoverMatrixComponent>;

type Story = StoryObj<TestRtPopoverMatrixComponent>;

/** Панель прижата к левому или правому краю триггера. Видно на панели шире триггера. */
export const Align: Story = { args: { part: 'align' } };

/** Ширина: панель повторяет ширину триггера или растёт по содержимому. */
export const Width: Story = { args: { part: 'width' } };

/** Отступ панели от триггера — вниз и вбок. */
export const Offset: Story = { args: { part: 'offset' } };
