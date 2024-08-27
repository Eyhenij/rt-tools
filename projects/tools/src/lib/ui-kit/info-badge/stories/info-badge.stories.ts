import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TestInfoBadgeComponent } from './component/test-info-badge/test-info-badge.component';
import { INFO_BADGE_PROPERTY_ENUM } from './utils/enum/info-badge-property.enum';

export default {
    title: 'Components/InfoBadge',
    component: TestInfoBadgeComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestInfoBadgeComponent>;

type Story = StoryObj<TestInfoBadgeComponent>;

export const InfoBadgeColors: Story = {
    args: { property: INFO_BADGE_PROPERTY_ENUM.COLOR },
};

export const InfoBadgeSizes: Story = {
    args: { property: INFO_BADGE_PROPERTY_ENUM.SIZE },
};

export const InfoBadgeWithIcon: Story = {
    args: { property: INFO_BADGE_PROPERTY_ENUM.ICON },
};

export const InfoBadgeBold: Story = {
    args: { property: INFO_BADGE_PROPERTY_ENUM.BOLD },
};

export const InfoBadgeEllipsis: Story = {
    args: { property: INFO_BADGE_PROPERTY_ENUM.ELLIPSIS },
};
