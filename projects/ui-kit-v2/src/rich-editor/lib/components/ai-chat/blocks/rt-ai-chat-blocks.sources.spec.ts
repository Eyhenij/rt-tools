import { Component } from '@angular/core';

import { IRtAiChat } from '../rt-ai-chat.model';
import { blocksToPlainText, sourcesBlockData, toBlockViews } from './rt-ai-chat-blocks.logic';

@Component({ selector: 'rt-test-sources-renderer', template: '' })
class TestSourcesRendererComponent {}

const SOURCES: IRtAiChat.SourcesBlock = {
    type: 'sources',
    items: [{ title: 'Отчёт «Продажи»', detail: 'Ноябрь 2026', icon: 'chart-bar', url: '/reports/sales' }, { title: 'Склад' }],
};

describe('rt-ai-chat-blocks logic: блок sources', (): void => {
    it('SC-UKV-1541 — кит рисует источники сам, отрисовщик из реестра для sources не берётся', (): void => {
        const renderers: IRtAiChat.BlockRenderer[] = [
            { type: 'sources', component: TestSourcesRendererComponent, toText: (): string => 'чужой' },
        ];
        const views: readonly IRtAiChat.BlockView[] = toBlockViews([SOURCES], renderers);

        expect(views.map((view: IRtAiChat.BlockView): string => view.kind)).toEqual(['sources']);
        expect(blocksToPlainText([SOURCES], renderers)).not.toContain('чужой');
    });

    it('SC-UKV-1549 — блок без источников — заглушка с именем типа, и отрисовщик его не подхватывает', (): void => {
        const renderers: IRtAiChat.BlockRenderer[] = [{ type: 'sources', component: TestSourcesRendererComponent }];
        const broken: IRtAiChat.Block[] = [
            { type: 'sources' },
            { type: 'sources', items: [] },
            { type: 'sources', items: [{ title: ' ' }] },
        ];

        expect(toBlockViews(broken, renderers)).toEqual(broken.map((): IRtAiChat.BlockView => ({ kind: 'unsupported', type: 'sources' })));
        expect(blocksToPlainText(broken, renderers)).toBe('');
        expect(sourcesBlockData({ type: 'kpi' })).toBeNull();
    });

    it('SC-UKV-1552 — копия даёт строку заголовка с числом и строку на источник через табуляцию', (): void => {
        expect(blocksToPlainText([SOURCES])).toBe('Sources\t2\nОтчёт «Продажи»\tНоябрь 2026\t/reports/sales\nСклад\t\t');
    });

    it('SC-UKV-1552 — подпись заголовка берётся из переданной, табуляция и перевод строки в тексте — пробел', (): void => {
        const block: IRtAiChat.SourcesBlock = { type: 'sources', items: [{ title: 'Продажи\tза\nноябрь', url: '/r' }] };

        expect(blocksToPlainText([block], [], 'ru', (value: string): string => value, 'Источники')).toBe(
            'Источники\t1\nПродажи за ноябрь\t\t/r'
        );
    });

    it('SC-UKV-1562 — источники в секции попадают в копию под её заголовком', (): void => {
        const section: IRtAiChat.SectionBlock = { type: 'section', title: 'Откуда цифры', blocks: [SOURCES] };

        expect(blocksToPlainText([section])).toBe(`Откуда цифры\n\n${blocksToPlainText([SOURCES])}`);
    });
});
