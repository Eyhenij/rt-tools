import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { RT_RADIUS_STEPS } from '../../radius/rt-radius.model';
import { TestRtTagComponent } from './component/test-tag.component';

export default {
    title: 'Atoms/Tag',
    component: TestRtTagComponent,
    argTypes: {
        value: { control: { type: 'text' } },
        severity: {
            options: ['info', 'success', 'warning', 'danger', 'secondary', 'neutral'],
            control: { type: 'select' },
        },
        appearance: {
            options: ['solid', 'outlined'],
            control: { type: 'select' },
        },
        radius: {
            options: [null, ...RT_RADIUS_STEPS],
            control: { type: 'select' },
        },
        icon: { control: false },
        iconEnd: { control: false },
        closable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtTagComponent>;

type TStory = StoryObj<TestRtTagComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        value: 'Значение',
        severity: 'neutral',
        appearance: 'solid',
        radius: null,
        icon: null,
        iconEnd: null,
        closable: false,
    },
};
