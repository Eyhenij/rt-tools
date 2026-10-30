import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtToasterHandleComponent } from './component/test-toaster-handle.component';

/**
 * Ручка тоста вживую: открыть, обновить, закрыть и узнать причину ухода. Тосты появляются по
 * нажатию и живут по таймерам, поэтому снимка нет; вид плашек с долей, подробностями и своим
 * компонентом снимает матрица `Atoms/Feedback/Toast` → Extras.
 */
export default {
    title: 'Molecules/Feedback/Toaster',
    component: TestRtToasterHandleComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtToasterHandleComponent>;

type TStory = StoryObj<TestRtToasterHandleComponent>;

export const Handle: TStory = {
    parameters: storySnapshotSkip('тосты появляются по нажатию и уходят по таймерам: кадр нечего снимать'),
};
