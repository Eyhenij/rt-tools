import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWorkspaceDetailsStatesComponent } from './component/test-workspace-details-states.component';

/** Ошибка загрузки по одобренному кадру. Контролов нет: оба вида рядом. */
export default {
    title: 'Organisms/Workspace/WorkspaceDetails',
    component: TestRtWorkspaceDetailsStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtWorkspaceDetailsStatesComponent>;

type TStory = StoryObj<TestRtWorkspaceDetailsStatesComponent>;

/** Ошибка во вкладке сведений и свой шаблон ошибки. */
export const ErrorState: TStory = { parameters: { snapshot: { fullPage: true } } };
