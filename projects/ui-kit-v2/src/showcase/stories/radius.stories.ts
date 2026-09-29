import { Meta, StoryObj } from '@storybook/angular';

import { TestRtRadiusComponent } from './component/test-radius.component';

/**
 * История уровня основ, а не компонента: вход скругления `radius` один на весь кит, и его сетка
 * лежит при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней не
 * относится — у входа нет своих состояний, а оси его компонентов показаны в их семьях.
 *
 * Десять столбцов не влезают в кадр, поэтому каждая сетка идёт тремя историями: умолчание с
 * малыми шагами, средние шаги и большие шаги.
 *
 * Без сетки остались компоненты, у которых шаг негде назвать или его не видно в ячейке: диалог и
 * нижняя панель стоят поверх страницы, шапка и список бесед тянутся на весь экран, календарю нужен
 * месяц на всю ячейку, ряд страниц пагинации и панель действий шире ячейки. У пункта меню и
 * колокольчика поверхность видна только под указателем, скругление зоны файла — только под
 * перетаскиванием. Их шаг проверяет контрактный спек входа.
 */
export default {
    title: 'Foundation/Radius',
    component: TestRtRadiusComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtRadiusComponent>;

type TStory = StoryObj<TestRtRadiusComponent>;

export const Controls: TStory = { args: { group: 'controls', part: 'small' } };

export const ControlsMiddle: TStory = { args: { group: 'controls', part: 'middle' } };

export const ControlsLarge: TStory = { args: { group: 'controls', part: 'large' } };

export const Surfaces: TStory = { args: { group: 'surfaces', part: 'small' } };

export const SurfacesMiddle: TStory = { args: { group: 'surfaces', part: 'middle' } };

export const SurfacesLarge: TStory = { args: { group: 'surfaces', part: 'large' } };
