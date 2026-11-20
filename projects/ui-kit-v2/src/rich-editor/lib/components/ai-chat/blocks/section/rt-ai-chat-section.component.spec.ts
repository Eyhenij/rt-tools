import { ChangeDetectionStrategy, Component, DebugElement, input, InputSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll, setInputs, textOf } from '../../../../../../testing/rt-kit-testing';
import { IRtAiChat } from '../../rt-ai-chat.model';
import { RtAiChatBlocksComponent } from '../rt-ai-chat-blocks.component';
import { provideRtAiChatBlock } from '../rt-ai-chat-blocks.providers';

/** Отрисовщик приложения: печатает поля `caption` и `span` своего блока. */
@Component({
    selector: 'rt-test-section-chart',
    template: '<p qa-dataid="test-section-chart">{{ block()["caption"] }} / {{ block()["span"] }}</p>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestSectionChartComponent {
    public readonly block: InputSignal<IRtAiChat.Block> = input.required<IRtAiChat.Block>();
}

const TABLE: IRtAiChat.Block = { type: 'table', columns: [{ label: 'Объект', type: 'text' }], rows: [['Вилла']] };
const KPI: IRtAiChat.Block = { type: 'kpi', items: [{ label: 'Ночи', value: 312 }] };

/** Секция рисуется лентой блоков: шаблон ячейки даёт она. */
function setup(blocks: readonly IRtAiChat.Block[]): ComponentFixture<RtAiChatBlocksComponent> {
    return createRtFixture(RtAiChatBlocksComponent, { blocks }, { providers: [provideRtAiChatBlock('chart', TestSectionChartComponent)] });
}

function node(target: DebugElement | null): HTMLElement {
    return target?.nativeElement as HTMLElement;
}

function cells(fixture: ComponentFixture<RtAiChatBlocksComponent>): HTMLElement[] {
    return qaAll(fixture, 'ai-chat-section-cell').map(node);
}

/** Место ячейки: модификатор `full` или `column` на её классе. */
function spanOf(cell: HTMLElement): string {
    return classesOf(cell)
        .filter((name: string): boolean => name.includes('--'))
        .map((name: string): string => name.split('--')[1])
        .join(' ');
}

describe('RtAiChatSectionComponent', (): void => {
    it('SC-UKV-1514 — ячейки стоят в порядке списка, каждая несёт место своего блока', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            {
                type: 'section',
                blocks: [{ type: 'chart', caption: 'Первый' }, TABLE, { type: 'chart', caption: 'Третий', span: 'column' }],
            },
        ]);
        const grid: HTMLElement = node(qa(fixture, 'ai-chat-section-grid'));
        const drawn: HTMLElement[] = cells(fixture);

        expect(Array.from(grid.children)).toEqual(drawn);
        expect(drawn.map(spanOf)).toEqual(['column', 'full', 'column']);
        expect(drawn[0].querySelector('[qa-dataid="test-section-chart"]')?.textContent).toBe('Первый / ');
        expect(drawn[1].querySelector('[qa-dataid="ai-chat-block-table"]')).not.toBeNull();
        expect(drawn[2].querySelector('[qa-dataid="test-section-chart"]')?.textContent).toBe('Третий / column');
        expect(drawn.map((cell: HTMLElement): number => cell.children.length)).toEqual([1, 1, 1]);
    });

    it('SC-UKV-1517 — заголовок обрезан, уровень 3, секция — группа, названная им', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            { type: 'section', title: '  Обзор ноября  ', blocks: [KPI] },
            { type: 'section', title: 'Обзор октября', blocks: [KPI] },
        ]);
        const sections: HTMLElement[] = qaAll(fixture, 'ai-chat-block-section').map(node);
        const titles: HTMLElement[] = qaAll(fixture, 'ai-chat-section-title').map(node);

        expect(titles.map(textOf)).toEqual(['Обзор ноября', 'Обзор октября']);
        expect(titles.map((title: HTMLElement): string | null => title.getAttribute('role'))).toEqual(['heading', 'heading']);
        expect(titles.map((title: HTMLElement): string | null => title.getAttribute('aria-level'))).toEqual(['3', '3']);
        expect(sections.map((section: HTMLElement): string | null => section.getAttribute('role'))).toEqual(['group', 'group']);
        expect(sections.map((section: HTMLElement): string | null => section.getAttribute('aria-labelledby'))).toEqual(
            titles.map((title: HTMLElement): string => title.id)
        );
        expect(titles[0].id).not.toBe('');
        expect(titles[0].id).not.toBe(titles[1].id);
    });

    it('SC-UKV-1517 — без заголовка, с пустым и с заголовком не строкой нет ни заголовка, ни роли', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            { type: 'section', blocks: [KPI] },
            { type: 'section', title: '  ', blocks: [KPI] },
            { type: 'section', title: 7, blocks: [KPI] },
        ]);
        const sections: HTMLElement[] = qaAll(fixture, 'ai-chat-block-section').map(node);

        expect(sections.length).toBe(3);
        expect(qaAll(fixture, 'ai-chat-section-title')).toEqual([]);
        expect(sections.map((section: HTMLElement): boolean => section.hasAttribute('role'))).toEqual([false, false, false]);
        expect(sections.map((section: HTMLElement): boolean => section.hasAttribute('aria-labelledby'))).toEqual([false, false, false]);
    });

    it('SC-UKV-1523 — новый список блоков перерисовывает сетку', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            { type: 'section', title: 'Обзор', blocks: [{ type: 'chart', caption: 'Один' }] },
        ]);

        expect(cells(fixture).map(spanOf)).toEqual(['column']);

        setInputs(fixture, {
            blocks: [
                { type: 'section', title: 'Обзор', blocks: [{ type: 'chart', caption: 'Один' }, { type: 'chart', caption: 'Два' }, TABLE] },
            ],
        });
        fixture.detectChanges();

        expect(cells(fixture).map(spanOf)).toEqual(['column', 'column', 'full']);
        expect(qaAll(fixture, 'test-section-chart').map(textOf)).toEqual(['Один /', 'Два /']);
        expect(qaAll(fixture, 'ai-chat-block-table').length).toBe(1);
    });

    it('SC-UKV-1525 — блок в ячейке рисуется правилами ленты и под её якорями', (): void => {
        const chart: IRtAiChat.Block = { type: 'chart', caption: 'Загрузка', span: 'full' };
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            { type: 'section', blocks: [KPI, chart, { type: 'table', columns: [] }, { type: 'никто-не-знает' }] },
        ]);
        const drawn: HTMLElement[] = cells(fixture);
        const plates: HTMLElement[] = qaAll(fixture, 'ai-chat-block-unsupported').map(node);

        expect(drawn[0].querySelector('[qa-dataid="ai-chat-block-kpi"] [qa-dataid="ai-chat-kpi-card"]')).not.toBeNull();
        expect(classesOf(drawn[0].firstElementChild as HTMLElement)).toContain('rt-ai-chat-blocks__kpi');
        expect(drawn[1].querySelector('[qa-dataid="test-section-chart"]')?.textContent).toBe('Загрузка / full');
        expect(plates.map((plate: HTMLElement): string | null => plate.getAttribute('data-type'))).toEqual(['table', 'никто-не-знает']);
        expect(plates.map((plate: HTMLElement): HTMLElement | null => plate.parentElement)).toEqual([drawn[2], drawn[3]]);
    });

    it('SC-UKV-1525 — секция из одних заглушек нарисована сеткой заглушек, а не одной заглушкой', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            { type: 'section', blocks: [{ type: 'table', columns: [] }, { type: 'никто-не-знает' }] },
        ]);

        expect(qaAll(fixture, 'ai-chat-block-section').length).toBe(1);
        expect(cells(fixture).length).toBe(2);
        expect(qaAll(fixture, 'ai-chat-block-unsupported').length).toBe(2);
    });

    it('SC-UKV-1515, SC-UKV-1516 — секция в секции и секция без блоков показаны заглушкой section', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = setup([
            {
                type: 'section',
                blocks: [
                    { type: 'section', blocks: [KPI] },
                    { type: 'markdown', text: 'Итог' },
                ],
            },
            { type: 'section', blocks: [] },
        ]);
        const plates: HTMLElement[] = qaAll(fixture, 'ai-chat-block-unsupported').map(node);

        expect(qaAll(fixture, 'ai-chat-block-section').length).toBe(1);
        expect(plates.map((plate: HTMLElement): string | null => plate.getAttribute('data-type'))).toEqual(['section', 'section']);
        expect(plates[0].parentElement).toBe(cells(fixture)[0]);
        expect(plates[1].parentElement).toBe(fixture.nativeElement as HTMLElement);
        expect(textOf(qa(fixture, 'ai-chat-block-markdown'))).toBe('Итог');
        expect(qaAll(fixture, 'ai-chat-block-kpi')).toEqual([]);
    });
});
