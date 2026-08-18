import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDownloadLinkComponent } from './component/test-download-link.component';

export default {
    title: 'Components/DownloadLink',
    component: TestRtDownloadLinkComponent,
    argTypes: {
        label: { control: { type: 'text' } },
    },
} as Meta<TestRtDownloadLinkComponent>;

type TStory = StoryObj<TestRtDownloadLinkComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Сохранить',
    },
};
