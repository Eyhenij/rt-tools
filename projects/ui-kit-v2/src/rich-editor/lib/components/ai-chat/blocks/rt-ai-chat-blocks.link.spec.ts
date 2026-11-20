import { Component } from '@angular/core';

import { IRtAiChat } from '../rt-ai-chat.model';
import { blocksToPlainText, linkBlockData, toBlockViews } from './rt-ai-chat-blocks.logic';

@Component({ selector: 'rt-test-link-renderer', template: '' })
class TestLinkRendererComponent {}

const LINK: IRtAiChat.LinkBlock = {
    type: 'link',
    title: 'Продажи за ноябрь',
    url: '/reports/sales',
    section: 'Отчёты · Продажи',
    state: 'failed',
    reason: 'Нет доступа к разделу',
};

describe('rt-ai-chat-blocks logic: блок link', (): void => {
    it('SC-UKV-1487 — кит рисует ссылку сам, отрисовщик из реестра для link не берётся', (): void => {
        const renderers: IRtAiChat.BlockRenderer[] = [
            { type: 'link', component: TestLinkRendererComponent, toText: (): string => 'чужой' },
        ];
        const views: readonly IRtAiChat.BlockView[] = toBlockViews([LINK], renderers);

        expect(views).toEqual([
            {
                kind: 'link',
                data: {
                    title: 'Продажи за ноябрь',
                    url: '/reports/sales',
                    section: 'Отчёты · Продажи',
                    icon: 'link',
                    state: 'failed',
                    reason: 'Нет доступа к разделу',
                },
            },
        ]);
        expect(blocksToPlainText([LINK], renderers)).not.toContain('чужой');
    });

    it('SC-UKV-1488 — ссылка без названия или адреса — заглушка с именем типа, и отрисовщик её не подхватывает', (): void => {
        const renderers: IRtAiChat.BlockRenderer[] = [{ type: 'link', component: TestLinkRendererComponent }];
        const broken: IRtAiChat.Block[] = [
            { type: 'link', url: '/reports' },
            { type: 'link', title: '  ', url: '/reports' },
            { type: 'link', title: 'Продажи' },
            { type: 'link', title: 'Продажи', url: 42 },
        ];

        expect(toBlockViews(broken, renderers)).toEqual(broken.map((): IRtAiChat.BlockView => ({ kind: 'unsupported', type: 'link' })));
        expect(blocksToPlainText(broken, renderers)).toBe('');
        expect(linkBlockData({ type: 'kpi' })).toBeNull();
    });

    it('SC-UKV-1496 — копия ответа даёт карточку одной строкой, без статуса и причины', (): void => {
        const copy: string = blocksToPlainText([LINK]);

        expect(copy).toBe('Продажи за ноябрь\tОтчёты · Продажи\t/reports/sales');
        expect(copy).not.toContain('Нет доступа');
    });

    it('SC-UKV-1496 — без раздела между табуляциями пустое поле; табуляция и перевод строки в названии — пробел', (): void => {
        expect(blocksToPlainText([{ type: 'link', title: 'Продажи', url: '/reports' }])).toBe('Продажи\t\t/reports');
        expect(blocksToPlainText([{ type: 'link', title: 'Продажи\tза\nноябрь', url: '/reports' }])).toBe('Продажи за ноябрь\t\t/reports');
    });

    it('SC-UKV-1496 — ссылка в секции попадает в копию под её заголовком', (): void => {
        const section: IRtAiChat.SectionBlock = { type: 'section', title: 'Куда смотреть', blocks: [LINK] };

        expect(blocksToPlainText([section])).toBe('Куда смотреть\n\nПродажи за ноябрь\tОтчёты · Продажи\t/reports/sales');
    });
});
