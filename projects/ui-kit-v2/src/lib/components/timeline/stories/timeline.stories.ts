import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTimelineComponent } from './component/test-timeline.component';

export default {
    title: 'Components/Timeline',
    component: TestRtTimelineComponent,
    argTypes: {
        steps: { control: 'object' },
    },
} as Meta<TestRtTimelineComponent>;

type Story = StoryObj<TestRtTimelineComponent>;

export const Playground: Story = {
    // Та же лента стоит ячейкой «все три состояния» в матрице состояния шага: отдельный кадр
    // проверял бы то же самое второй раз, а меняется он от любой правки аргументов.
    parameters: storySnapshotSkip('эта лента уже стоит ячейкой в матрице состояния шага'),
    args: {
        steps: [
            { label: 'Заявка принята', meta: '12 марта, 09:14', actor: 'Отдел продаж', status: 'complete' },
            { label: 'Договор подписан', meta: '14 марта, 16:02', actor: 'Юридический отдел', status: 'complete' },
            { label: 'Ожидает оплаты', meta: '15 марта, 10:30', actor: 'Бухгалтерия', status: 'current' },
            { label: 'Подключение', status: 'pending' },
        ],
    },
};
