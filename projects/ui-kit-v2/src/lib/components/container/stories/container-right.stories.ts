import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtContainerRightComponent } from './component/test-container-right.component';

/**
 * Правая панель каркаса: место рядом с содержимым или поверх страницы, подложка и ширина с ручкой.
 * Кнопки внутри переносят открытую панель между местами — так видно, что она остаётся открытой.
 */
export default {
    title: 'Organisms/Layout/Container',
    component: TestRtContainerRightComponent,
    argTypes: {
        mode: { options: ['side', 'over'], control: { type: 'select' } },
        backdrop: { control: { type: 'boolean' } },
        resizable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtContainerRightComponent>;

type TStory = StoryObj<TestRtContainerRightComponent>;

export const RightSide: TStory = {
    args: { mode: 'side', backdrop: true, resizable: true, width: 280 },
};

export const RightOver: TStory = {
    parameters: storySnapshotSkip('панель поверх страницы живёт в оверлее во всё окно, за пределами кадра истории'),
    args: { mode: 'over', backdrop: false, resizable: true, width: 320 },
};
