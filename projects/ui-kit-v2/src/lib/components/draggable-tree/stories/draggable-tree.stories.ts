import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDraggableTreeComponent } from './component/test-draggable-tree.component';

export default {
    title: 'Organisms/Forms/DraggableTree',
    component: TestRtDraggableTreeComponent,
    argTypes: {
        nodes: { control: false },
        lastMove: { control: false },
    },
} as Meta<TestRtDraggableTreeComponent>;

type TStory = StoryObj<TestRtDraggableTreeComponent>;

/** Здесь узлы переносят руками: перетаскиванием за ручку или клавишами с Alt. */
export const Playground: TStory = {
    parameters: storySnapshotSkip('дерево в покое уже стоит ячейкой «вложенность» в матрице содержимого'),
};
