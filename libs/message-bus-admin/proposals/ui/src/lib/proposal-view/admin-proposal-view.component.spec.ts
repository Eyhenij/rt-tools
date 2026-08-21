import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IProposal } from '@rt/message-bus-admin/proposals/util';

import { AdminProposalViewComponent } from './admin-proposal-view.component';

function entityOf(patch: Partial<IProposal.State> = {}): IProposal.State {
    return {
        id: 'q1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        resource: 'rules/lists.md',
        address: 'Ловушки',
        arrivedAt: new Date('2026-08-14T21:30:00.000Z'),
        fixNote: '',
        text: 'ловушку стоит назвать',
        month: '2026-08',
        ...patch,
    };
}

describe('AdminProposalViewComponent', () => {
    let fixture: ComponentFixture<AdminProposalViewComponent>;

    /**
     * Значение свойства лежит внутри строки кита и носит её признак: свой признак у панели
     * теперь на самой строке, а не на теге значения.
     */
    function textOf(qaId: string): string {
        const own: DebugElement | null = fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`));
        const value: DebugElement | null = own?.query(By.css('[qa-dataid="detail-row-value"]')) ?? null;

        return (value ?? own)?.nativeElement.textContent.trim() ?? '';
    }

    function show(entity: IProposal.State): void {
        fixture.componentRef.setInput('entity', entity);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [AdminProposalViewComponent] });

        fixture = TestBed.createComponent(AdminProposalViewComponent);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('поля записи названы деревом, ресурсом, адресом, месяцем и временем', () => {
        show(entityOf());

        expect(textOf('proposal-tree')).toBe('Приёмник');
        expect(textOf('proposal-resource')).toBe('rules/lists.md');
        expect(textOf('proposal-address')).toBe('Ловушки');
        expect(textOf('proposal-month')).toBe('2026-08');
        expect(textOf('proposal-arrived')).not.toBe('');
    });

    it('время показано днём и минутами, а не строкой ответа', () => {
        show(entityOf({ arrivedAt: new Date('2026-08-14T21:30:00.000Z') }));

        expect(textOf('proposal-arrived')).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('времени, которого нет, ячейка не выдаёт за настоящее', () => {
        show(entityOf({ arrivedAt: new Date('') }));

        expect(textOf('proposal-arrived')).toBe('—');
    });

    it('текст предложения показан целиком', () => {
        show(entityOf({ text: 'ловушку стоит назвать\nи привести пример' }));

        expect(textOf('proposal-text')).toBe('ловушку стоит назвать\nи привести пример');
    });

    it('разметка, приехавшая с дерева, показана текстом и в разметку страницы не попадает', () => {
        show(entityOf({ text: '<script>alert(1)</script><b>жирным</b>' }));

        expect(textOf('proposal-text')).toBe('<script>alert(1)</script><b>жирным</b>');
        expect(fixture.debugElement.query(By.css('[qa-dataid="proposal-text"] script'))).toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="proposal-text"] b'))).toBeNull();
    });

    it('SC-MB-137, SC-MB-141 — свойства стоят в готовом списке кита, а своего списка определений в панели нет', () => {
        show(entityOf());

        expect(fixture.debugElement.queryAll(By.css('rt-detail-list rt-detail-row')).length).toBe(5);
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

    it('SC-MB-189 — панель показывает текст починки отдельной секцией', () => {
        show(entityOf({ fixNote: 'статьёй правила о выемке путей' }));

        const note: DebugElement | null = fixture.debugElement.query(By.css('[qa-dataid="proposal-fix-note"]'));

        expect(note).not.toBeNull();
        expect(note?.nativeElement.textContent.trim()).toBe('статьёй правила о выемке путей');
    });

    it('SC-MB-190 — у записи без текста починки секции нет вовсе', () => {
        show(entityOf({ fixNote: '' }));

        // Отрицательное утверждение идёт в паре с положительным: сперва показано, что панель
        // отрисована, и только потом — что секции починки в ней нет
        expect(fixture.debugElement.query(By.css('[qa-dataid="proposal-text"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="proposal-fix-note"]'))).toBeNull();
    });
});
