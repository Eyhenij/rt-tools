import { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';

import { TestActionBarComponent } from './component/test-action-bar.component';

export default {
    title: 'Components/ActionBar',
    component: TestActionBarComponent,
} as Meta<TestActionBarComponent>;

type TStory = StoryObj<TestActionBarComponent>;

export const Counter: TStory = {
    args: { selected: 3, total: 128, actions: 'plain' },
};

/** Ноль выбранного: панель показывает его числом, а не прячет счётчик. */
export const CounterZero: TStory = {
    args: { selected: 0, total: 128, actions: 'plain' },
};

/**
 * Значения, при которых подпись счётчика переносится. Одних длинных чисел мало: на широком
 * окне подпись влезает в строку, и перенос показывает только пара «длинные числа плюс узкая
 * рамка кадра».
 */
export const CounterWrapped: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: { selected: 1284567, total: 98765432, actions: 'plain' },
};

export const PlainActions: TStory = {
    args: { selected: 3, total: 128, actions: 'plain' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const canvas: ReturnType<typeof within> = within(canvasElement);
        // Нажимается узел, а не подпись: за порогом планшета у кнопки со значком её нет вовсе.
        const first: HTMLElement = canvasElement.querySelector('.rtui-action-bar__action') as HTMLElement;

        await userEvent.click(first);

        // Нажатие действия закрывает панель само — в списке оба события, и в этом порядке.
        await expect(canvas.getByText('Случилось: Скачать → закрытие')).toBeTruthy();
    },
};

/** Действие с вложенным меню: слой раскрывает `play`, иначе история показывает одну панель. */
export const MenuAction: TStory = {
    args: { selected: 3, total: 128, actions: 'menu' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        // Тот же приём: подпись за порогом планшета скрыта, и целью служит сам узел действия.
        await userEvent.click(canvasElement.querySelector('.rtui-action-bar__action') as HTMLElement);

        // Меню рисуется в теле страницы, а не внутри панели, — искать его надо там.
        await expect(document.querySelector('.rtui-action-bar-action-menu')).not.toBeNull();
    },
};

export const StyledAction: TStory = {
    args: { selected: 3, total: 128, actions: 'styled' },
};

/** Пустой набор: панель остаётся счётчиком и закрытием, зоны действий у неё нет вовсе. */
export const NoActions: TStory = {
    args: { selected: 3, total: 128, actions: 'empty' },
};

export const Close: TStory = {
    args: { selected: 3, total: 128, actions: 'plain' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const canvas: ReturnType<typeof within> = within(canvasElement);
        const close: HTMLElement = canvasElement.querySelector('.rtui-action-bar__close-button') as HTMLElement;

        await userEvent.click(close);
        await expect(canvas.getByText('Случилось: закрытие')).toBeTruthy();
    },
};

/**
 * Узкий кадр: за порогом планшета подпись у кнопки со значком прячется, и от кнопки остаётся
 * один значок. Порог живёт в службе точек перелома, а переключает его ширина окна показа.
 */
export const Tablet: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: { selected: 3, total: 128, actions: 'plain' },
};
