import { Meta, StoryObj } from '@storybook/angular';

import { TestToolbarComponent } from './component/test-toolbar.component';

export default {
    title: 'Components/Toolbar',
    component: TestToolbarComponent,
} as Meta<TestToolbarComponent>;

type TStory = StoryObj<TestToolbarComponent>;

export const AllSlots: TStory = {
    args: {
        hasLeft: true,
        hasCenter: true,
        hasRight: true,
        sticky: false,
        longPage: false,
        title: 'Записи',
    },
};

export const LeftOnly: TStory = {
    args: {
        hasLeft: true,
        hasCenter: false,
        hasRight: false,
        sticky: false,
        longPage: false,
    },
};

export const RightOnly: TStory = {
    args: {
        hasLeft: false,
        hasCenter: false,
        hasRight: true,
        sticky: false,
        longPage: false,
    },
};

/**
 * Панели не видно, и это её честный вид: без единого поданного слота разметка кита не рисует
 * ничего. Пустая рамка здесь — показ, а не поломка показа.
 */
export const NoSlots: TStory = {
    args: {
        hasLeft: false,
        hasCenter: false,
        hasRight: false,
        sticky: false,
        longPage: false,
    },
};

/** Прокрутка нужна обеим историям закрепления: без неё они выглядят одинаково. */
export const StickyOn: TStory = {
    args: {
        hasLeft: true,
        hasCenter: true,
        hasRight: true,
        sticky: true,
        longPage: true,
        title: 'Панель остаётся у верхнего края',
    },
};

export const StickyOff: TStory = {
    args: {
        hasLeft: true,
        hasCenter: true,
        hasRight: true,
        sticky: false,
        longPage: true,
        title: 'Панель уезжает вместе со страницей',
    },
};

/**
 * Узкий экран: высота панели объявлена медиа-запросом по ширине окна показа, и переключает его
 * рамка кадра. Входа узкого экрана у панели нет вовсе.
 */
export const Narrow: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: {
        hasLeft: true,
        hasCenter: true,
        hasRight: true,
        sticky: false,
        longPage: false,
        title: 'Очень длинное название раздела, которое в узкую панель не влезает',
    },
};
