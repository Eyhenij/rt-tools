import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMenuItemMatrixComponent } from './component/test-menu-item-matrix.component';

/**
 * Свой значок пункта меню — `<ng-template rtMenuItemIcon>`. Своей разметки у директивы нет: кит
 * ставит содержимое шаблона на место значка пункта его размером и красит цветом тона. Кадр держит
 * рисунок, которого нет в наборе кита, в обычном, опасном тоне и тоне согласия.
 *
 * Входов у директивы нет, поэтому `Playground` у неё нет: крутить нечего. Контролов здесь нет
 * намеренно.
 */
export default {
    title: 'Molecules/Navigation/MenuItemIcon',
    component: TestRtMenuItemMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMenuItemMatrixComponent>;

type TStory = StoryObj<TestRtMenuItemMatrixComponent>;

export const Tones: TStory = { args: { part: 'own-icon' } };
