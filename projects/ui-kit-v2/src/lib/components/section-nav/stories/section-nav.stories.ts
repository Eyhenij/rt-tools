import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSectionNavComponent } from './component/test-section-nav.component';

export default {
    title: 'Molecules/Navigation/SectionNav',
    component: TestRtSectionNavComponent,
    argTypes: {
        items: { control: 'object' },
    },
} as Meta<TestRtSectionNavComponent>;

type TStory = StoryObj<TestRtSectionNavComponent>;

export const Playground: TStory = {
    // Тот же набор стоит ячейкой «первая плитка» в матрице подсветки: отдельный кадр проверял бы
    // то же самое второй раз, а меняется он от любой правки аргументов.
    parameters: storySnapshotSkip('этот набор уже стоит ячейкой в матрице подсветки'),
    args: {
        items: [
            { id: 'overview', icon: 'ico-listing', label: 'Обзор', active: true },
            { id: 'members', icon: 'ico-users', label: 'Участники', active: false },
            { id: 'settings', icon: 'ico-settings', label: 'Настройки', active: false },
        ],
    },
};
