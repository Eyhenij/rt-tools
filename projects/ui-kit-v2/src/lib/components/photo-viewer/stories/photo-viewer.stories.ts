import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPhotoViewerComponent } from './component/test-photo-viewer.component';

export default {
    title: 'Components/PhotoViewer',
    component: TestRtPhotoViewerComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtPhotoViewerComponent>;

type TStory = StoryObj<TestRtPhotoViewerComponent>;

/** Три кадра, открыт первый: видны счётчик, крестик и обе стрелки. */
export const Playground: TStory = {};
