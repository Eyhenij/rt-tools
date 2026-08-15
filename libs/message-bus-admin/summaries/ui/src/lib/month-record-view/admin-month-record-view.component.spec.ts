import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IMonthRecord } from '@rt/message-bus-admin/summaries/util';

import { AdminMonthRecordViewComponent } from './admin-month-record-view.component';

function entityOf(patch: Partial<IMonthRecord.State> = {}): IMonthRecord.State {
    return {
        id: 'm1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        month: '2026-08',
        sessions: 19,
        ranAt: new Date('2026-08-15T09:20:05.257Z'),
        summary: '{\n    "days": 3\n}',
        ...patch,
    };
}

describe('AdminMonthRecordViewComponent', () => {
    let fixture: ComponentFixture<AdminMonthRecordViewComponent>;

    function textOf(qaId: string): string {
        return fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`))?.nativeElement.textContent.trim() ?? '';
    }

    function show(entity: IMonthRecord.State): void {
        fixture.componentRef.setInput('entity', entity);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [AdminMonthRecordViewComponent] });

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
        show(entityOf({ summary: '{\n    "days": 3,\n    "tree": "a1b2"\n}' }));

        expect(textOf('month-record-summary')).toContain('"days": 3');
        expect(textOf('month-record-summary')).toContain('"tree": "a1b2"');
    });

    it('разметка, приехавшая с дерева, показана текстом и в разметку страницы не попадает', () => {
        show(entityOf({ summary: '{\n    "note": "<script>alert(1)</script><b>жирным</b>"\n}' }));

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
});
