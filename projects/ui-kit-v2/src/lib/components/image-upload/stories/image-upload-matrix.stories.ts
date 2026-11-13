import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtImageUploadMatrixComponent } from './component/test-image-upload-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Forms/ImageUpload',
    component: TestRtImageUploadMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtImageUploadMatrixComponent>;

type TStory = StoryObj<TestRtImageUploadMatrixComponent>;

/** Пусто, картинка, со скачиванием, загрузка и недоступен. Обрезку показывают `Cropping` и `Applied`. */
export const States: TStory = { args: { part: 'states' } };

export const Presets: TStory = { args: { part: 'presets' } };

/**
 * Настройки кнопок и подложки: кнопка выбора в другом виде и без значка, кнопка скачивания своего
 * размера со своим значком и размытием. Свойства блока заданы на самом загрузчике.
 */
export const Options: TStory = { args: { part: 'options' } };

/**
 * Кнопка удаления и место кнопок: крестик под наведением и в фокусе, обе кнопки, вид «внутри
 * картинки» и четыре угла. Наведение ставится на превью, а в двух ячейках — и на сам крестик.
 */
export const Buttons: TStory = {
    args: { part: 'buttons' },
    parameters: { pseudo: storyPseudoParameters(':is(.rt-image-upload__preview, .rt-image-upload__remove button)') },
};

export const Themes: TStory = { args: { part: 'themes' } };
