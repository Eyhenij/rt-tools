import { Meta, StoryObj } from '@storybook/angular';

import { TestInfoBadgeComponent } from './component/test-info-badge/test-info-badge.component';
import { EInfoBadgeProperty } from './utils/enum/info-badge-property.enum';

export default {
    title: 'Components/InfoBadge',
    component: TestInfoBadgeComponent,
} as Meta<TestInfoBadgeComponent>;

type TStory = StoryObj<TestInfoBadgeComponent>;

export const InfoBadgeColors: TStory = {
    args: { property: EInfoBadgeProperty.COLOR },
};

export const InfoBadgeSizes: TStory = {
    args: { property: EInfoBadgeProperty.SIZE },
};

export const InfoBadgeWithIcon: TStory = {
    args: { property: EInfoBadgeProperty.ICON },
};

export const InfoBadgeBold: TStory = {
    args: { property: EInfoBadgeProperty.BOLD },
};

export const InfoBadgeEllipsis: TStory = {
    args: { property: EInfoBadgeProperty.ELLIPSIS },
};
