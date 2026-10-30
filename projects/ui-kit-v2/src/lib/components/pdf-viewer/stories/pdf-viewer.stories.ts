import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPdfViewerComponent } from './component/test-pdf-viewer.component';

export default {
    title: 'Organisms/PdfViewer',
    component: TestRtPdfViewerComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtPdfViewerComponent>;

type TStory = StoryObj<TestRtPdfViewerComponent>;

/** Три страницы, открыт документ целиком: полоса с именем, страницы столбцом и плашка масштаба. */
export const Playground: TStory = {};
