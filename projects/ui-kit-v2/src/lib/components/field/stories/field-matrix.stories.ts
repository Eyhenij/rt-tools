import { Args, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS, storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtFieldMaterialComponent } from './component/test-field-material.component';
import { TestRtFieldMatrixComponent } from './component/test-field-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Историй наведения и фокуса у обёртки нет: своих состояний взаимодействия она не имеет,
 * они принадлежат контролу внутри и показаны в его матрице.
 */
export default {
    title: 'Molecules/Forms/Field',
    component: TestRtFieldMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFieldMatrixComponent>;

type TStory = StoryObj<TestRtFieldMatrixComponent>;

export const Anatomy: TStory = { args: { part: 'anatomy' } };

export const Required: TStory = { args: { part: 'required' } };

export const ErrorPart: TStory = { name: 'Error', args: { part: 'error' } };

export const Hint: TStory = { args: { part: 'hint' } };

export const Modes: TStory = { args: { part: 'modes' } };

export const States: TStory = { args: { part: 'states' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };

/**
 * Подпись внутри контрола под материальным набором: на месте подсказки у пустого поля, на верхней
 * рамке у заполненного и в фокусе. Звёздочка — цвета подписи, у недействительного поля — цвета
 * ошибки. Свой вид кита держит подпись над полем.
 */
export const LabelInside: TStory = {
    args: { part: 'inside' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

/**
 * Размер поля Material под материальным набором: 56 px при плотности 0 и на 4 px меньше за каждый
 * шаг атрибута `data-rt-density` до 36 px при −5; значение 16 px. Наведение красит рамку цветом
 * текста. Свой вид кита атрибута не замечает.
 */
export const Density: TStory = {
    args: { part: 'density' },
    // Признак стоит на поле, а наведение стилизовано на контроле внутри него.
    parameters: { pseudo: storyPseudoParameters('.rt-input') },
};

/**
 * Поле материального набора против поля Material при плотности −1: залитое и обведённое, ввод и
 * выбор, значок слева, отказ под полем. Признак набора стоит на самом поле или на предке, плотность
 * и своя высота приложения — на предке; наименьшая ширина поля задана свойством на предке.
 */
export const Material: TStory = {
    decorators: [moduleMetadata({ imports: [TestRtFieldMaterialComponent] })],
    // Признак стоит на поле: подпись поднимает фокус поля, а черту фокуса рисует контрол внутри него.
    parameters: { pseudo: { focusWithin: [STORY_PSEUDO_PARAMETERS['focusWithin'], storyPseudoParameters('.rt-input')['focusWithin']] } },
    render: (args: Args): { props: Args; template: string } => ({ props: args, template: '<app-field-material />' }),
};
