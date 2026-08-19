import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtStepperComponent } from './component/test-stepper.component';

export default {
    title: 'Atoms/Feedback/Stepper',
    component: TestRtStepperComponent,
    argTypes: {
        steps: { control: 'object' },
        currentIndex: { control: { type: 'number' } },
    },
} as Meta<TestRtStepperComponent>;

type TStory = StoryObj<TestRtStepperComponent>;

export const Playground: TStory = {
    // Тот же набор стоит ячейкой «середина — 50 %» в матрице положения: отдельный кадр проверял
    // бы то же самое второй раз, а меняется он от любой правки аргументов.
    parameters: storySnapshotSkip('этот набор уже стоит ячейкой в матрице положения шага'),
    args: {
        steps: [
            { label: 'Заявка', description: 'Проверяем данные организации.' },
            { label: 'Договор', description: 'Готовим договор и согласуем условия.' },
            { label: 'Подключение', description: 'Открываем доступ и передаём ключи.' },
        ],
        currentIndex: 1,
    },
};
