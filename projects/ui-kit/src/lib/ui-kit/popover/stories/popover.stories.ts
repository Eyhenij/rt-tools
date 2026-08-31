import { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';

import { TestPopoverComponent } from './component/test-popover.component';

export default {
    title: 'Components/Popover',
    component: TestPopoverComponent,
} as Meta<TestPopoverComponent>;

type TStory = StoryObj<TestPopoverComponent>;

export const ShortContent: TStory = {
    args: { inline: true, content: 'short', popoverClass: '' },
};

export const LongContent: TStory = {
    args: { inline: true, content: 'long', popoverClass: '' },
};

export const MarkupContent: TStory = {
    args: { inline: true, content: 'markup', popoverClass: '' },
};

/** Класс от потребителя садится на хост слоя: директива своего входа под него не имеет. */
export const ConsumerClass: TStory = {
    args: { inline: true, content: 'markup', popoverClass: 'popover-accent' },
};

/** Шаблон не подан: слой есть, а рисовать ему нечего — пустое место здесь показ, а не поломка. */
export const NoContent: TStory = {
    args: { inline: true, content: 'none', popoverClass: '' },
};

/** Закрытый слой: на странице только источник, разметки слоя нет вовсе. */
export const TriggerClosed: TStory = {
    args: { inline: false, content: 'short' },
};

/**
 * Слой, открытый нажатием. Нажимает `play`: без него история показывает одну кнопку, и читатель
 * видит ровно то же, что в закрытой.
 */
export const TriggerOpened: TStory = {
    args: { inline: false, content: 'short' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const canvas: ReturnType<typeof within> = within(canvasElement);

        await userEvent.click(canvas.getByText('Показать слой'));

        // Слой рисуется в теле страницы, а не внутри хоста источника, — искать его надо там.
        await expect(document.querySelector('rtui-popover-container')).not.toBeNull();
    },
};
