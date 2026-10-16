import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtToggleButtonGroupMatrixComponent } from './component/test-toggle-button-group-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Forms/ToggleButtonGroup',
    component: TestRtToggleButtonGroupMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtToggleButtonGroupMatrixComponent>;

type TStory = StoryObj<TestRtToggleButtonGroupMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Options: TStory = { args: { part: 'options' } };

export const Value: TStory = { args: { part: 'value' } };

export const FullWidth: TStory = { args: { part: 'fullWidth' } };

export const Multiple: TStory = { args: { part: 'multiple' } };

/**
 * Недоступный сегмент остаётся на месте: спрятанный, он оставил бы группу без объяснения, почему
 * сегментов стало меньше, — а причина всегда временная.
 */
export const DisabledOption: TStory = { args: { part: 'disabledOption' } };

/**
 * Состояния принадлежат сегменту, а не группе, — аддону передан спуск до кнопки. Признак стоит
 * на хосте, поэтому подсвечиваются сразу все сегменты ячейки: так видно, что делает наведение,
 * не заставляя искать, по какому из них навели.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-toggle-button-group__button') },
};

/**
 * Группа в форме: `formControlName`/`[formControl]` и сигнальная `[formField]`. Под каждой группой —
 * значение контрола: нажатие пишет его в форму, а отключённый формой контрол нажатий не принимает.
 */
export const Forms: TStory = { args: { part: 'forms' } };

/** Своя разметка сегмента: значок формата над подписью; подчёркнута подпись нажатого. */
export const OptionTemplate: TStory = { args: { part: 'optionTemplate' } };

/** Раскладка: одна строка, перенос в узком месте (рамка — ширина места) и столбик. */
export const Layout: TStory = { args: { part: 'layout' } };

/**
 * Вид «чипы» против сегментов: отдельные пункты с обводкой, выбранный залит, у выбранного может
 * стоять галочка. Строки — размер, множественный выбор, недоступный пункт, отключённая группа,
 * раскладка; в материальной половине — фильтр-чип Material.
 */
export const Appearance: TStory = { args: { part: 'appearance' } };

/** Взаимодействие с чипом: наведение, фокус, нажатие, недоступность — как у сегмента в States. */
export const ChipsStates: TStory = {
    args: { part: 'chipsStates' },
    parameters: { pseudo: storyPseudoParameters('.rt-toggle-button-group__button') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
