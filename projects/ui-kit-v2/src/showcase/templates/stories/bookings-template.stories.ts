import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBookingsTemplateComponent } from './component/test-bookings-template.component';

/**
 * Целый экран раздела, собранный из компонентов кита: каркас с верхней навигацией и левым меню,
 * заголовок раздела с подсказкой, тулбар с отбором и действиями, таблица с тегами, копируемыми
 * ячейками и меню строки, переключатель страниц, панели заведения и правки записи.
 *
 * Уровень `Templates`, а не `Organisms`: это не компонент с осями входов, а образец сборки
 * страницы — то, что потребитель повторяет у себя. Договор о покрытии состояниями к нему не
 * относится по той же причине, по какой не относится к историям уровня основ: ни `Playground`,
 * ни `States` у целого экрана нет.
 */
export default {
    title: 'Templates/List Page',
    component: TestRtBookingsTemplateComponent,
} as Meta<TestRtBookingsTemplateComponent>;

type TStory = StoryObj<TestRtBookingsTemplateComponent>;

/**
 * Список заявок с открытым разделом. Панель заведения открывается кнопкой в тулбаре, панель
 * правки — кликом по строке; обе живут своим адресом и переживают перезагрузку страницы.
 */
export const Screen: TStory = {
    parameters: {
        // Кадр целой страницы, а не корня показа: у этой истории показ рисует не сетка обвязки,
        // а сам экран во весь вьюпорт.
        snapshot: { fullPage: true },
    },
};
