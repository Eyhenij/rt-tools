import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { RT_RADIUS_STEPS } from '../../radius/rt-radius.model';
import { TestRtButtonComponent } from './component/test-button.component';

export default {
    title: 'Atoms/Buttons/Button',
    component: TestRtButtonComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        icon: { control: { type: 'text' } },
        iconPos: {
            options: ['left', 'right'],
            control: { type: 'select' },
        },
        theme: {
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'],
            control: { type: 'select' },
        },
        appearance: {
            options: ['filled', 'outlined', 'text'],
            control: { type: 'select' },
        },
        size: {
            options: ['sm', 'md', 'lg', 'xl', '2xl'],
            control: { type: 'select' },
        },
        radius: {
            options: [null, ...RT_RADIUS_STEPS],
            control: { type: 'select' },
        },
        loading: { control: { type: 'boolean' } },
        loadingIcon: { control: { type: 'text' } },
    },
} as Meta<TestRtButtonComponent>;

type TStory = StoryObj<TestRtButtonComponent>;

export const Playground: TStory = {
    // Значения по умолчанию уже стоят ячейкой внутри матрицы этого же компонента: отдельный кадр
    // проверял бы то же самое второй раз, а меняется он от любой правки аргументов.
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Сохранить',
        icon: null,
        iconPos: 'left',
        theme: 'primary',
        appearance: 'filled',
        size: 'md',
        radius: null,
        loading: false,
        loadingIcon: null,
    },
};
