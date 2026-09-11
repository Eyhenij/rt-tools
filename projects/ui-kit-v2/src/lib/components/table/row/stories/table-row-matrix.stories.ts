import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../../showcase/story-states';
import { TestRtTableRowMatrixComponent } from './component/test-table-row-matrix.component';

/**
 * Директива нажимаемой строки таблицы. Своей разметки у неё нет: она даёт строке
 * фокусируемость и активацию щелчком и клавишей, а видимого следа у неё два — курсор и кольцо
 * фокуса. До этой истории она не стояла ни в одной обёртке витрины вовсе, и правку в ней не
 * стерёг ни один кадр.
 *
 * Входов у директивы нет, поэтому `Playground` у неё нет: крутить нечего. Контролов здесь нет
 * намеренно.
 */
export default {
    title: 'Organisms/Table/TableRow',
    component: TestRtTableRowMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTableRowMatrixComponent>;

type TStory = StoryObj<TestRtTableRowMatrixComponent>;

/** Обычная строка, под наведением, под нажатием и под фокусом с клавиши — все четыре сразу. */
export const States: TStory = {
    args: { part: 'states' },
    // Признак стоит на самой строке, а не на обёртке вокруг неё: цель селектора пустая.
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
