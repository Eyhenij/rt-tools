import { IDBStorageService } from '@rt-tools/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTableComponent } from './component/test-table.component';

export default {
    title: 'Components/Table',
    component: TestRtTableComponent,
    // Таблица держит настройки колонок в IndexedDB и просит службу хранилища у окружения, а
    // `provideRtStorage()` её не отдаёт: без этой строки история рисует не таблицу, а страницу
    // отказа `NG0201`. Поставляется здесь, а не общими провайдерами витрины, — служба нужна
    // одной таблице.
    decorators: [
        applicationConfig({
            providers: [IDBStorageService],
        }),
    ],
    argTypes: {
        ariaLabel: { control: { type: 'text' } },
        density: {
            options: ['default', 'compact'],
            control: { type: 'select' },
        },
        cards: { control: { type: 'boolean' } },
        clickable: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        fetching: { control: { type: 'boolean' } },
        columns: { control: false },
        columnsConfig: { control: false },
        tableId: { control: { type: 'text' } },
        showRowActions: { control: { type: 'boolean' } },
        rowHasActions: { control: false },
        sort: { control: false },
        skeletonRows: { control: { type: 'number' } },
        emptyMessage: { control: { type: 'text' } },
        emptyIcon: { control: false },
        emptyDescription: { control: { type: 'text' } },
    },
} as Meta<TestRtTableComponent>;

type Story = StoryObj<TestRtTableComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустые `columns` и `columnsConfig`, и таблица не рисует ни строки; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        ariaLabel: null,
        density: 'default',
        cards: true,
        clickable: false,
        loading: false,
        fetching: false,
        columns: [],
        columnsConfig: [],
        tableId: null,
        showRowActions: false,
        rowHasActions: null,
        sort: null,
        skeletonRows: 5,
        emptyMessage: '',
        emptyIcon: 'inbox',
        emptyDescription: null,
    },
};
