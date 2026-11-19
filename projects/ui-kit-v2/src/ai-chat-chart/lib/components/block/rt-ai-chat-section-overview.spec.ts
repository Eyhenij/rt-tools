import { ComponentFixture } from '@angular/core/testing';

import { rtAiChatSectionSchema, TRtJsonSchema } from '../../../../lib/util/section.schema';
import { RtAiChatBlocksComponent } from '../../../../rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component';
import { IRtAiChat } from '../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { createRtFixture, qaAll } from '../../../../testing/rt-kit-testing';
import { provideRtAiChatChart } from '../../ai-chat-chart.providers';
import { RT_AI_CHAT_CHART_BLOCK_SCHEMA, RT_AI_CHAT_CHART_SCHEMA } from '../../ai-chat-chart.schema';
import { rtAiChatChartState } from '../../ai-chat-chart.view';
import { AI_CHAT_SECTION_OVERVIEW } from './stories/component/ai-chat-section.fixture';

/**
 * Библиотеки проверки схем в дереве нет, поэтому спека читает схему сама: ровно те слова, которыми
 * написаны схемы блоков кита. Слово, которого здесь нет, роняет проверку, а не пропускается.
 */
type TCheck = (schema: unknown, value: unknown) => boolean;
type TRule = (rule: unknown, value: unknown, check: TCheck) => boolean;

function fields(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : null;
}

function list(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function typeOf(value: unknown): string {
    if (Array.isArray(value)) {
        return 'array';
    }

    return value === null ? 'null' : typeof value;
}

function properties(rule: unknown, value: unknown, check: TCheck): boolean {
    const own: Record<string, unknown> | null = fields(value);

    return (
        own === null ||
        Object.entries(fields(rule) ?? {}).every(([key, schema]: [string, unknown]): boolean => !(key in own) || check(schema, own[key]))
    );
}

function conditional(schema: Record<string, unknown>, value: unknown, check: TCheck): boolean {
    if (!('if' in schema)) {
        return true;
    }

    return check(schema[check(schema['if'], value) ? 'then' : 'else'] ?? true, value);
}

const RULES: Readonly<Record<string, TRule>> = {
    type: (rule: unknown, value: unknown): boolean => (Array.isArray(rule) ? rule : [rule]).includes(typeOf(value)),
    const: (rule: unknown, value: unknown): boolean => rule === value,
    enum: (rule: unknown, value: unknown): boolean => list(rule).includes(value),
    required: (rule: unknown, value: unknown): boolean =>
        list(rule).every((key: unknown): boolean => typeof key === 'string' && key in (fields(value) ?? {})),
    properties,
    items: (rule: unknown, value: unknown, check: TCheck): boolean => list(value).every((item: unknown): boolean => check(rule, item)),
    minItems: (rule: unknown, value: unknown): boolean => !Array.isArray(value) || value.length >= Number(rule),
    maxItems: (rule: unknown, value: unknown): boolean => !Array.isArray(value) || value.length <= Number(rule),
    minLength: (rule: unknown, value: unknown): boolean => typeof value !== 'string' || value.length >= Number(rule),
    minimum: (rule: unknown, value: unknown): boolean => typeof value !== 'number' || value >= Number(rule),
    pattern: (rule: unknown, value: unknown): boolean => typeof value !== 'string' || new RegExp(String(rule)).test(value),
    not: (rule: unknown, value: unknown, check: TCheck): boolean => !check(rule, value),
    allOf: (rule: unknown, value: unknown, check: TCheck): boolean => list(rule).every((schema: unknown): boolean => check(schema, value)),
    oneOf: (rule: unknown, value: unknown, check: TCheck): boolean =>
        list(rule).filter((schema: unknown): boolean => check(schema, value)).length === 1,
};

/** Слова без проверки значения: подписи схемы и условие, которое читает `conditional`. */
const SILENT: ReadonlySet<string> = new Set<string>(['$schema', 'title', 'description', 'if', 'then', 'else']);

function accepts(schema: unknown, value: unknown): boolean {
    if (typeof schema === 'boolean') {
        return schema;
    }
    const own: Record<string, unknown> | null = fields(schema);

    if (own === null) {
        throw new Error(`Схема не запись: ${JSON.stringify(schema)}`);
    }

    return (
        conditional(own, value, accepts) &&
        Object.entries(own).every(([word, rule]: [string, unknown]): boolean => {
            if (SILENT.has(word)) {
                return true;
            }
            if (!(word in RULES)) {
                throw new Error(`Спека не знает слова схемы «${word}»`);
            }

            return RULES[word](rule, value, accepts);
        })
    );
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

    beforeEach((): void => {
        Object.defineProperty(window, 'ResizeObserver', { value: ResizeDouble, configurable: true, writable: true });
    });

    it('SC-UKV-1524 — схема, собранная со схемой блока графика, принимает обзор и каждый его блок', (): void => {
        const item: unknown = fields(fields(schema['properties'])?.['blocks'])?.['items'];

        expect(NESTED.map((block: unknown): unknown => fields(block)?.['type'])).toEqual(['markdown', 'kpi', 'chart', 'chart', 'table']);
        expect(NESTED.map((block: unknown): boolean => accepts(item, block))).toEqual([true, true, true, true, true]);
        expect(accepts(schema, SECTION)).toBe(true);
    });

    it('SC-UKV-1524 — схема отвергает секцию в секции, блок без своего поля и график со спецификацией в корне', (): void => {
        const chart: Record<string, unknown> = fields(fields(CHARTS[0])?.['spec']) ?? {};

        expect(accepts(schema, { type: 'section', blocks: [] })).toBe(false);
        expect(accepts(schema, { type: 'section', blocks: [SECTION] })).toBe(false);
        expect(accepts(schema, { type: 'section', blocks: [{ type: 'markdown' }] })).toBe(false);
        expect(accepts(schema, { type: 'section', blocks: [{ type: 'notice', severity: 'loud', text: 'x' }] })).toBe(false);
        expect(accepts(schema, { type: 'section', blocks: [{ type: 'chart', ...chart }] })).toBe(false);
        expect(accepts(schema, { type: 'section', blocks: [{ type: 'chart', spec: chart, span: 'wide' }] })).toBe(false);
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
