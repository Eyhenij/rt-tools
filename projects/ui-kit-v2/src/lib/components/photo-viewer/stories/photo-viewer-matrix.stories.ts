import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPhotoViewerMatrixComponent } from './component/test-photo-viewer-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 *
 * Ряда из ячеек здесь нет: просмотрщик занимает весь показ, и два экземпляра рядом наложились
 * бы друг на друга. Каждый случай показан своей историей на весь кадр.
 */
export default {
    title: 'Components/PhotoViewer',
    component: TestRtPhotoViewerMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtPhotoViewerMatrixComponent>;

type Story = StoryObj<TestRtPhotoViewerMatrixComponent>;

/** Открыт последний кадр: счётчик показывает конец набора, а листать вперёд некуда. */
export const LastPhoto: Story = { args: { part: 'start' } };

/** Один кадр: стрелок нет вовсе — рядом с историей выше видно, что их убирает сам просмотрщик. */
export const SinglePhoto: Story = { args: { part: 'single' } };

export const Themes: Story = { args: { part: 'themes' } };
