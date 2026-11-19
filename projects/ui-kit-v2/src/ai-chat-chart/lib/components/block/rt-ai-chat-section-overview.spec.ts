import { ComponentFixture } from '@angular/core/testing';
import Ajv2020 from 'ajv/dist/2020';

import { rtAiChatSectionSchema, TRtJsonSchema } from '../../../../lib/util/section.schema';
import { RtAiChatBlocksComponent } from '../../../../rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component';
import { IRtAiChat } from '../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { createRtFixture, qaAll } from '../../../../testing/rt-kit-testing';
import { provideRtAiChatChart } from '../../ai-chat-chart.providers';
import { RT_AI_CHAT_CHART_BLOCK_SCHEMA, RT_AI_CHAT_CHART_SCHEMA } from '../../ai-chat-chart.schema';
import { rtAiChatChartState } from '../../ai-chat-chart.view';
import { AI_CHAT_SECTION_OVERVIEW } from './stories/component/ai-chat-section.fixture';

/** Проверка по JSON Schema 2020-12 настоящим валидатором: нестрогий режим, как у схемы KPI с двумя типами значения. */
function validator(schema: TRtJsonSchema): (value: unknown) => boolean {
    const validate: (value: unknown) => boolean = new Ajv2020({ strict: false }).compile(schema);

    return (value: unknown): boolean => validate(value);
}

function fields(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : null;
}

function list(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

/** Наблюдатель размеров, которого в jsdom нет: графику достаточно, что он создаётся. */
class ResizeDouble implements ResizeObserver {
    public observe(): void {}

    public unobserve(): void {}

    public disconnect(): void {}
}

const SECTION: IRtAiChat.Block = AI_CHAT_SECTION_OVERVIEW[0];
const NESTED: readonly unknown[] = list(Reflect.get(SECTION, 'blocks'));
const CHARTS: readonly unknown[] = NESTED.filter((block: unknown): boolean => fields(block)?.['type'] === 'chart');

describe('схема секции и ответ «обзор месяца»', (): void => {
    const schema: TRtJsonSchema = rtAiChatSectionSchema({ chart: RT_AI_CHAT_CHART_BLOCK_SCHEMA });
    const accepts: (value: unknown) => boolean = validator(schema);

    beforeEach((): void => {
        Object.defineProperty(window, 'ResizeObserver', { value: ResizeDouble, configurable: true, writable: true });
    });

    it('SC-UKV-1524 — схема, собранная со схемой блока графика, принимает обзор и каждый его блок', (): void => {
        expect(NESTED.map((block: unknown): unknown => fields(block)?.['type'])).toEqual(['markdown', 'kpi', 'chart', 'chart', 'table']);
        expect(NESTED.map((block: unknown): boolean => accepts({ blocks: [block] }))).toEqual([true, true, true, true, true]);
        expect(accepts(SECTION)).toBe(true);
    });

    it('SC-UKV-1524 — схема отвергает секцию в секции, блок без своего поля и график со спецификацией в корне', (): void => {
        const chart: Record<string, unknown> = fields(fields(CHARTS[0])?.['spec']) ?? {};

        expect(accepts({ type: 'section', blocks: [] })).toBe(false);
        expect(accepts({ type: 'section', blocks: [SECTION] })).toBe(false);
        expect(accepts({ type: 'section', blocks: [{ type: 'markdown' }] })).toBe(false);
        expect(accepts({ type: 'section', blocks: [{ type: 'notice', severity: 'loud', text: 'x' }] })).toBe(false);
        expect(accepts({ type: 'section', blocks: [{ type: 'chart', ...chart }] })).toBe(false);
        expect(accepts({ type: 'section', blocks: [{ type: 'chart', spec: chart, span: 'wide' }] })).toBe(false);
    });

    it('SC-UKV-1524 — блок графика, принятый схемой, готов к отрисовке; схема блока держит схему спецификации в spec', (): void => {
        expect(CHARTS).toHaveLength(2);
        expect(CHARTS.map((block: unknown): string => rtAiChatChartState(block).kind)).toEqual(['ready', 'ready']);
        expect(fields(RT_AI_CHAT_CHART_BLOCK_SCHEMA['properties'])?.['spec']).toEqual(
            Object.fromEntries(Object.entries(RT_AI_CHAT_CHART_SCHEMA).filter(([word]: [string, unknown]): boolean => word !== '$schema'))
        );
        expect(RT_AI_CHAT_CHART_BLOCK_SCHEMA['required']).toEqual(['spec']);
    });

    it('SC-UKV-1525 — обзор, принятый схемой, нарисован без единой заглушки: два графика, KPI, таблица, текст', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = createRtFixture(
            RtAiChatBlocksComponent,
            { blocks: AI_CHAT_SECTION_OVERVIEW },
            { providers: [provideRtAiChatChart()] }
        );
        await fixture.whenStable();
        fixture.detectChanges();

        expect(qaAll(fixture, 'ai-chat-section-cell')).toHaveLength(5);
        expect(qaAll(fixture, 'ai-chat-block-unsupported')).toHaveLength(0);
        expect(qaAll(fixture, 'ai-chat-chart-invalid')).toHaveLength(0);
        expect(qaAll(fixture, 'ai-chat-chart-plot')).toHaveLength(2);
        expect(qaAll(fixture, 'ai-chat-block-kpi')).toHaveLength(1);
        expect(qaAll(fixture, 'ai-chat-block-table')).toHaveLength(1);
        expect(qaAll(fixture, 'ai-chat-block-markdown')).toHaveLength(1);
    });
});
