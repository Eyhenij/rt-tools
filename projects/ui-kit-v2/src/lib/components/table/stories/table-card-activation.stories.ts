import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableCardFocusComponent } from './component/test-table-card-focus.component';

/**
 * Нажатие на карточку узкого показа. Своей разметки у директивы нет: она даёт карточке фокус и
 * передаёт нажатие, Enter и пробел спрятанной строке с тем же номером. Видимых следов у неё два —
 * курсор и кольцо фокуса, и кадр держит второй.
 *
 * Входы директиве ставит сама таблица, поэтому `Playground` у неё нет: крутить нечего. Контролов
 * здесь нет намеренно.
 */
export default {
    title: 'Organisms/Table/TableCardActivation',
    component: TestRtTableCardFocusComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTableCardFocusComponent>;

type TStory = StoryObj<TestRtTableCardFocusComponent>;

/** Первая карточка нажимаемой таблицы стоит под фокусом с клавиши, вторая — обычная. */
export const States: TStory = {
    parameters: { pseudo: { focusVisible: '.rt-table--clickable .rt-table__card:first-of-type' } },
};
