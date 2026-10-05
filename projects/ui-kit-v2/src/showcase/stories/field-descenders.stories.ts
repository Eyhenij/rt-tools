import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFieldDescendersComponent } from './component/test-field-descenders.component';

/**
 * История уровня основ, а не компонента: высота строки у полей кита общая, и проверяет её один
 * кадр на все поля. Договор о покрытии состояний к ней не относится — у неё нет ни осей входов,
 * ни состояний.
 */
export default {
    title: 'Foundation/Design Tokens/Field Descenders',
    component: TestRtFieldDescendersComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFieldDescendersComponent>;

type TStory = StoryObj<TestRtFieldDescendersComponent>;

export const FieldDescenders: TStory = {};
