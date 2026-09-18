import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IMonthRecord } from '@rt/message-bus-admin/summaries/util';

import { AdminMonthRecordViewComponent } from './admin-month-record-view.component';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

function entityOf(patch: Partial<IMonthRecord.State> = {}): IMonthRecord.State {
    return {
        id: 'm1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        month: '2026-08',
        sessions: 19,
        ranAt: new Date('2026-08-15T09:20:05.257Z'),
        summary: '```json\n{\n    "days": 3\n}\n```',
        ...patch,
    };
}

describe('AdminMonthRecordViewComponent', () => {
    let fixture: ComponentFixture<AdminMonthRecordViewComponent>;

    /**
     * Значение свойства лежит внутри строки кита и носит её признак: свой признак у панели
     * теперь на самой строке, а не на теге значения.
     */
    function textOf(qaId: string): string {
        const own: DebugElement | null = fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`));
        const value: DebugElement | null = own?.query(By.css('[qa-dataid="detail-row-value"]')) ?? null;

        return (value ?? own)?.nativeElement.textContent.trim() ?? '';
    }

    function show(entity: IMonthRecord.State): void {
        fixture.componentRef.setInput('entity', entity);
        fixture.detectChanges();
    }

    beforeEach(() => {
        // Подписи приходят из словаря, а он читает выбранный язык из браузерного хранилища:
        // без хранилища компонент не собирается вовсе.
        TestBed.configureTestingModule({ imports: [AdminMonthRecordViewComponent], providers: [provideRtUtils(), provideRtStorage()] });

        fixture = TestBed.createComponent(AdminMonthRecordViewComponent);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('поля записи названы деревом, месяцем, счётом заходов и временем прогона', () => {
        show(entityOf());

        expect(textOf('month-record-tree')).toBe('Приёмник');
        expect(textOf('month-record-month')).toBe('2026-08');
        expect(textOf('month-record-sessions')).toBe('19');
        expect(textOf('month-record-ran')).not.toBe('');
    });

    it('время показано днём и минутами, а не строкой ответа', () => {
        show(entityOf());

        expect(textOf('month-record-ran')).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('сводка показана целиком', () => {
        show(entityOf({ summary: '```json\n{\n    "days": 3,\n    "tree": "a1b2"\n}\n```' }));

        expect(textOf('month-record-summary')).toContain('"days": 3');
        expect(textOf('month-record-summary')).toContain('"tree": "a1b2"');
    });

    it('SC-MB-214 — тело сводки показано блоком кода, и отступы его раскладки видны', () => {
        show(entityOf({ summary: '```json\n{\n    "days": 3\n}\n```' }));

        const code: HTMLElement = fixture.debugElement.query(
            By.css('[qa-dataid="month-record-summary"] [qa-dataid="markdown-code"]')
        ).nativeElement;

        expect(code.textContent).toContain('    "days": 3');
        // Ограда — разметка, а не содержимое: показанной она быть не должна
        expect(code.textContent).not.toContain('```');
    });

    it('сырой HTML, приехавший с дерева, показан текстом и в разметку страницы не попадает', () => {
        show(entityOf({ summary: '```json\n{\n    "note": "<script>alert(1)</script><b>жирным</b>"\n}\n```' }));

        expect(textOf('month-record-summary')).toContain('<script>alert(1)</script>');
        expect(fixture.debugElement.query(By.css('[qa-dataid="month-record-summary"] script'))).toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="month-record-summary"] b'))).toBeNull();
    });

    it('месяц без сводки объясняет себя словами, а не пустым местом', () => {
        show(entityOf({ summary: '', sessions: 0 }));

        expect(fixture.debugElement.query(By.css('[qa-dataid="month-record-summary"]'))).toBeNull();
        expect(textOf('month-record-summary-missing')).toContain('Сводки в этом месяце ещё не было');
        expect(textOf('month-record-sessions')).toBe('0');
    });

    it('SC-MB-137, SC-MB-141 — свойства стоят в готовом списке кита, а своего списка определений в панели нет', () => {
        show(entityOf());

        expect(fixture.debugElement.queryAll(By.css('rt-detail-list rt-detail-row')).length).toBe(4);
        expect(fixture.debugElement.query(By.css('dl'))).toBeNull();
        expect(fixture.debugElement.query(By.css('dt'))).toBeNull();
        expect(fixture.debugElement.query(By.css('dd'))).toBeNull();
    });

    it('SC-MB-138, SC-MB-141 — разделы панели нарисованы разделом кита, а своего заголовка в ней нет', () => {
        show(entityOf());

        expect(fixture.debugElement.queryAll(By.css('rt-aside-section')).length).toBe(2);
        expect(fixture.debugElement.query(By.css('[qa-dataid="aside-section-heading"]')).nativeElement.textContent.trim()).not.toBe('');
        expect(fixture.debugElement.query(By.css('h2'))).toBeNull();
    });
});
