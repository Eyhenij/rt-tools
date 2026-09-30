import { Meta, StoryObj } from '@storybook/angular';

import { TestRtImageCropperMatrixComponent } from './component/test-image-cropper-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/ImageCropper',
    component: TestRtImageCropperMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtImageCropperMatrixComponent>;

type TStory = StoryObj<TestRtImageCropperMatrixComponent>;

/** Свободная рамка — весь исходник; заданная — наибольшая своей пропорции по центру. */
export const Ratios: TStory = { args: { part: 'ratios' } };

/** Круглый вид — маска на экране; ручки остаются на квадрате рамки. */
export const Looks: TStory = { args: { part: 'looks' } };

/** Без исходника, готова, недоступна и не прочиталось. Загрузка мгновенна и в кадр не попадает. */
export const States: TStory = { args: { part: 'states' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
