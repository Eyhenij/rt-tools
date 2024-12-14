import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { PlatformService } from '../../../util';
import { listOfPersons, TestSelectorComponent } from './component/selector/test-selector.component';

const routes: Routes = [
    {
        path: '**',
        redirectTo: '',
    },
];

export default {
    title: 'Components/DynamicSelector',
    component: TestSelectorComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations(), provideRouter(routes), PlatformService],
        }),
    ],
    argTypes: {},
} as Meta<TestSelectorComponent>;

type Story = StoryObj<TestSelectorComponent>;

export const Selector: Story = {
    args: {
        loading: false,
        fetching: false,
        isMobile: false,
        isListDraggable: true,
        entities: listOfPersons,
        isAdditionalControlShown: false,
        isMultiToggleShown: false,
        isSelectAllButtonShown: true,
        isOpenPopupButtonShown: true,
    },
};

export const SelectorWithAdditional: Story = {
    args: {
        loading: false,
        fetching: false,
        isMobile: false,
        isListDraggable: true,
        entities: listOfPersons,
        isAdditionalControlShown: true,
        isMultiToggleShown: false,
    },
};

export const SelectorWithReadonly: Story = {
    args: {
        loading: false,
        fetching: false,
        isMobile: false,
        isListDraggable: true,
        entities: listOfPersons,
        hasReadonly: true,
        isMultiToggleShown: false,
    },
};

export const SelectorSingleMode: Story = {
    args: {
        loading: false,
        fetching: false,
        isMobile: false,
        entities: listOfPersons,
        isSingleMode: true,
    },
};

export const NoData: Story = {
    args: {
        entities: [],
    },
};
