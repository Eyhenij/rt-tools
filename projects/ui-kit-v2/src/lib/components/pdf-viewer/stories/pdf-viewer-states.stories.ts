import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPdfViewerStatesComponent } from './component/test-pdf-viewer-states.component';

/**
 * Свой вид ошибки по одобренному кадру. Просмотрщик занимает весь показ, поэтому случай один на
 * историю; заглушка кита показана историей `Failed` матрицы.
 */
export default {
    title: 'Organisms/PdfViewer',
    component: TestRtPdfViewerStatesComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtPdfViewerStatesComponent>;

type TStory = StoryObj<TestRtPdfViewerStatesComponent>;

/** Документ не открылся, и стоит свой шаблон `rtPdfViewerError` с текстом ошибки и download(). */
export const OwnError: TStory = {};
