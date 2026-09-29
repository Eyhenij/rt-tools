import { Meta, StoryObj } from '@storybook/angular';

import { TestRtRadiusComponent } from './component/test-radius.component';

/**
 * История уровня основ, а не компонента: вход скругления `radius` один на весь кит, и его сетка
 * лежит при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней не
 * относится — у входа нет своих состояний, а оси его компонентов показаны в их семьях.
 *
 * Без сетки остались компоненты, у которых шаг негде назвать или его не видно в ячейке: диалог и
 * нижняя панель стоят поверх страницы, шапка и список бесед тянутся на весь экран, календарю нужен
 * месяц на всю ячейку. Их шаг проверяет контрактный спек входа.
 */
export default {
    title: 'Foundation/Radius',
    component: TestRtRadiusComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtRadiusComponent>;

type TStory = StoryObj<TestRtRadiusComponent>;

export const Controls: TStory = { args: { group: 'controls' } };

export const Surfaces: TStory = { args: { group: 'surfaces' } };
