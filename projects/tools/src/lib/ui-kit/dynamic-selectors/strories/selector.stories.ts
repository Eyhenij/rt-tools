import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter } from '@angular/router';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { PlatformService } from '../../../util';
import { TestSelectorComponent, listOfPersons } from './component/selector/test-selector.component';

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
        isListDraggable: false,
        entities: listOfPersons,
        isAdditionalControlShown: false,
        isMultiToggleShown: false,
    },
};

export const SelectorWithAdditional: Story = {
    args: {
        loading: false,
        fetching: false,
        isMobile: false,
        isListDraggable: false,
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
        isListDraggable: false,
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
