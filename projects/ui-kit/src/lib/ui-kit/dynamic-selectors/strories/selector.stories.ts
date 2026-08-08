import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor } from 'storybook/test';

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

/**
 * Пустой выбор: вместо списка показана заглушка со своей кнопкой. Другой истории с этой
 * кнопкой нет, а без неё её оформление не проверяет ничто.
 *
 * Список очищается нажатием, а не значением входа: обёртка задаёт начальный выбор при
 * запуске, а значения истории приходят к ней позже.
 */
export const SelectorPlaceholder: Story = {
    args: {
        entities: listOfPersons,
        isOpenPopupButtonShown: true,
        isSelectAllButtonShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const clear: HTMLElement | undefined = [...canvasElement.querySelectorAll<HTMLElement>('button')].find(
            (node: HTMLElement) => node.querySelector('mat-icon')?.textContent?.trim() === 'delete_forever'
        );

        if (!clear) {
            throw new Error('Кнопки очистки списка в истории нет');
        }

        await userEvent.click(clear);
        await waitFor(() => expect(canvasElement.querySelector('rtui-dynamic-selector-placeholder')).toBeTruthy());
    },
};

/**
 * Попап выбора, открытый нажатием. Его подвал живёт в перекрытии и в кадр сам не попадает:
 * без нажатия проверить оформление кнопок «Cancel» и «SUBMIT» нечем.
 */
export const SelectorPopup: Story = {
    args: {
        // Список короткий намеренно: с полным попап уходит за нижний край кадра вместе с
        // подвалом, ради которого история и заведена.
        entities: listOfPersons.slice(0, 8),
        isListDraggable: true,
        isOpenPopupButtonShown: true,
        isSelectAllButtonShown: true,
    },
    // Попап рисуется в перекрытии, и полный снимок его не достраивает: кадр под него выше.
    parameters: { snapshotViewport: { height: 1100 } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const trigger: HTMLElement | null = canvasElement.querySelector('[cdkoverlayorigin]');

        if (!trigger) {
            throw new Error('Кнопка, открывающая попап выбора, в истории не отрисована');
        }

        await userEvent.click(trigger);
        await waitFor(() => expect(document.querySelector('rtui-multi-selector-popup')).toBeTruthy());
    },
};
