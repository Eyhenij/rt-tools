import { Meta, StoryObj } from '@storybook/angular';

import { startStoryFileDrag } from '../../../../showcase/story-drag';
import { TestRtFileDropComponent } from './component/test-file-drop.component';

export default {
    title: 'Components/FileDrop',
    component: TestRtFileDropComponent,
    argTypes: {
        disabled: { control: { type: 'boolean' } },
        overlayLabel: { control: { type: 'text' } },
        zones: { control: false },
        accept: { control: { type: 'text' } },
    },
} as Meta<TestRtFileDropComponent>;

type Story = StoryObj<TestRtFileDropComponent>;

export const Playground: Story = {
    args: {
        disabled: false,
        overlayLabel: '',
        accept: '',
    },
};

/**
 * Многозонный режим: подсказка делится на равные полосы, и сброс приходит с именем зоны.
 * Общего события сброса в этом режиме не бывает — зона обязана быть названа.
 *
 * Перетаскивание начинает `play`: зоны рисуются только под ним, и без жеста история показывала
 * обычную область в покое — то есть ровно то же, что `Playground`. Курсор «висит» на верхней
 * трети, поэтому активна первая зона: активную выбирает координата, а не вход.
 */
export const Zoned: Story = {
    args: {
        ...Playground.args,
        zones: [
            { id: 'docs', label: 'Документы', sublabel: 'договоры и акты' },
            { id: 'photos', label: 'Фотографии' },
        ],
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await startStoryFileDrag(canvasElement, 0.25);
    },
};
