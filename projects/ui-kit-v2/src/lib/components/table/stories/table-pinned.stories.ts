import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTablePinnedComponent } from './component/test-table-pinned.component';

/**
 * Закреплённая колонка — те же шесть кадров, что в макете: закрепление у начала и у конца, начало,
 * середина и конец прокрутки, два кадра в тёмной теме. Тень у края видна, пока под колонкой есть
 * прокрученное содержимое; закреплённая ячейка берёт цвет своей строки — обычной, проблемной и
 * строки итога. Наведение не показано: витрина не держит указатель над строкой в кадре.
 */
export default {
    title: 'Organisms/Table/Table',
    component: TestRtTablePinnedComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTablePinnedComponent>;

type TStory = StoryObj<TestRtTablePinnedComponent>;

export const PinnedColumn: TStory = {};
