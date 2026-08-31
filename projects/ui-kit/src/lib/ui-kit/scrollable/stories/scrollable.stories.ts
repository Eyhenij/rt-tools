import { Meta, StoryObj } from '@storybook/angular';

import { TestScrollableComponent } from './component/test-scrollable.component';

export default {
    title: 'Components/Scrollable',
    component: TestScrollableComponent,
} as Meta<TestScrollableComponent>;

type TStory = StoryObj<TestScrollableComponent>;

export const AllParts: TStory = {
    args: {
        hasHeader: true,
        hasContent: true,
        hasFooter: true,
        rowCount: 40,
        title: 'Шапка, длинное тело и подвал',
    },
};

export const ContentOnly: TStory = {
    args: {
        hasHeader: false,
        hasContent: true,
        hasFooter: false,
        rowCount: 40,
    },
};

export const HeaderAndContent: TStory = {
    args: {
        hasHeader: true,
        hasContent: true,
        hasFooter: false,
        rowCount: 40,
        title: 'Шапка и тело, подвала нет',
    },
};

/** Содержимое короче высоты тела: прокручивать нечего, и полосы прокрутки не появляется. */
export const ShortContent: TStory = {
    args: {
        hasHeader: true,
        hasContent: true,
        hasFooter: true,
        rowCount: 3,
        title: 'Содержимое короче высоты',
    },
};

/** Содержимое длиннее высоты тела: прокручивается тело, шапка и подвал стоят на месте. */
export const LongContent: TStory = {
    args: {
        hasHeader: true,
        hasContent: true,
        hasFooter: true,
        rowCount: 60,
        title: 'Содержимое длиннее высоты',
    },
};
