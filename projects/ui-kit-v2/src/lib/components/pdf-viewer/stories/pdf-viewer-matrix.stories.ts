import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPdfViewerMatrixComponent } from './component/test-pdf-viewer-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: загрузка и отказ.
 *
 * Ряда из ячеек здесь нет: просмотрщик занимает весь показ, и два экземпляра рядом наложились
 * бы друг на друга. Каждое состояние показано своей историей на весь кадр.
 */
export default {
    title: 'Organisms/PdfViewer',
    component: TestRtPdfViewerMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtPdfViewerMatrixComponent>;

type TStory = StoryObj<TestRtPdfViewerMatrixComponent>;

/** Документ грузится: полоса с именем уже видна, на месте страниц — индикатор. */
export const Loading: TStory = { args: { part: 'loading' } };

/** Документ не удалось показать: заголовок, пояснение и кнопка скачивания по центру. */
export const Failed: TStory = { args: { part: 'error' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
