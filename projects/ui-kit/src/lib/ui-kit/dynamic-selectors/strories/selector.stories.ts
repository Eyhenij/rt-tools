import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { PlatformService } from '@rt-tools/core';
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
    parameters: {
        docs: {
            description: {
                component: `
**rtui-dynamic-selector** — generic-компонент выбора множества (или одного) entity из списка.

### Возможности
- **Value Accessor** + **Validator** — работает как FormControl или через \`[(chosenEntities)]\` (ModelSignal).
- **Single / Multi mode** — \`isSingleSelection\`.
- **Drag & Drop** — \`isListDraggable\` + handle на каждом элементе.
- **Readonly entities** — \`readonlyEntitiesKeys\` блокирует удаление конкретных элементов.
- **Local / lazy search** — \`isLocalSearch\`, \`isLazyLoad\` + \`scrollAction\`.
- **Кастомный sort** — \`sortFn\`.

### Slot-проекции (через marker-директивы)
- \`*rtuiDynamicSelectorAdditionalControlDirective\` — доп. контролы справа от title (иконки, бейджи).
- \`rtuiDynamicSelectorItemTitleProjectionDirective\` — **полная замена** дефолтного title-блока кастомной разметкой. Контекст темплейта: \`{ $implicit: ENTITY }\`.

### Истории
| Story | Что показывает |
| --- | --- |
| **Selector** | Базовый multi-select с drag & drop |
| **Selector With Additional** | Доп. контролы в строке (info / star / Label) |
| **Selector With Custom Title** | Кастомный темплейт title через \`rtuiDynamicSelectorItemTitleProjectionDirective\` |
| **Selector With Readonly** | Часть элементов нельзя удалить |
| **Selector Single Mode** | Радио-режим (один выбор) |
| **No Data** | Empty state |
                `,
            },
        },
    },
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

export const SelectorWithCustomTitle: Story = {
    args: {
        loading: false,
        fetching: false,
        isMobile: false,
        isListDraggable: true,
        entities: listOfPersons,
        isCustomTitleShown: true,
        isMultiToggleShown: false,
        isSelectAllButtonShown: true,
        isOpenPopupButtonShown: true,
    },
    parameters: {
        docs: {
            description: {
                story: `
Демонстрирует **\`rtuiDynamicSelectorItemTitleProjectionDirective\`** — слот для **полной замены** title в строке выбранного entity.

\`\`\`html
<rtui-dynamic-selector ...>
    <ng-template rtuiDynamicSelectorItemTitleProjectionDirective let-entity>
        <span class="custom-title">
            <mat-icon>person</mat-icon>
            <strong>#{{ entity.id }}</strong>
            <span>{{ entity.name }}</span>
        </span>
    </ng-template>
</rtui-dynamic-selector>
\`\`\`

Если темплейт не задан — рендерится дефолтный \`<span>\` с tooltip / breakString / titlecase.
                `,
            },
        },
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
