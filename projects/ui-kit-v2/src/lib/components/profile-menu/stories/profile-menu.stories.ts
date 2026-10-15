import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtProfileMenuComponent } from './component/test-profile-menu.component';
import { PROFILE_MENU_ORGANIZATION, PROFILE_MENU_USER } from './component/test-profile-menu.data';

export default {
    title: 'Molecules/Navigation/ProfileMenu',
    component: TestRtProfileMenuComponent,
    argTypes: {
        userName: { control: { type: 'text' } },
        organizationName: { control: { type: 'text' } },
        organizationChange: { control: { type: 'inline-radio' }, options: ['hidden', 'denied', 'allowed'] },
        passwordChange: { control: { type: 'boolean' } },
        withLocales: { control: { type: 'boolean' } },
        signOutDisabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtProfileMenuComponent>;

type TStory = StoryObj<TestRtProfileMenuComponent>;

/** Живое меню профиля: каждая часть включается своим контролом. */
export const Playground: TStory = {
    parameters: storySnapshotSkip('все сочетания частей уже стоят ячейками в матрице этого компонента'),
    args: {
        userName: PROFILE_MENU_USER,
        organizationName: PROFILE_MENU_ORGANIZATION,
        organizationChange: 'allowed',
        passwordChange: true,
        withLocales: true,
        signOutDisabled: false,
    },
};
