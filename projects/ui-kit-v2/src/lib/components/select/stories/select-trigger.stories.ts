import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtSelectTriggerComponent } from './component/test-select-trigger.component';

/**
 * Страница своего указателя выбора — входа `[rtSelectTrigger]`.
 *
 * Отдельная от матрицы выбора намеренно: указатель принимают обе семьи, выбор одного значения и
 * выбор нескольких, поэтому он не ось ни одной из них. Внутри матрицы он стоял одной строкой из
 * десяти, и найти его там можно было, только зная, что он там есть.
 *
 * Страницы с входами здесь нет и быть не может: содержимое указателя приезжает проекцией шаблона, а
 * витрина умеет подставлять значения, а не разметку.
 */
export default {
    title: 'Molecules/Forms/SelectTrigger',
    component: TestRtSelectTriggerComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSelectTriggerComponent>;

type TStory = StoryObj<TestRtSelectTriggerComponent>;

/**
 * Пара указателей в одном кадре: зашитый китом и свой, объявленный шаблоном. Порознь ни одна
 * половина не показывает, чем она отличается от другой.
 */
export const Against: TStory = { args: { part: 'against' } };

/** Один вход на обе семьи: разница у них только внутри кнопки — подпись против ряда меток. */
export const Families: TStory = { args: { part: 'families' } };

/**
 * Состояния своего указателя. Взяты оба фокуса: у зашитого указателя полевое кольцо рисуется и на
 * `:focus`, а у своего его нет ни там, ни на ходе клавишами — вместо кольца обводка по содержимому
 * кнопки. Признак спускается до кнопки: правила написаны на ней, а не на хосте.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-select__trigger') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
