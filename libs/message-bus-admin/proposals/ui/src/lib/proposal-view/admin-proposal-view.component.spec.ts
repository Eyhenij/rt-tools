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
        text: 'ловушку стоит назвать',
        month: '2026-08',
        ...patch,
    };
}

describe('AdminProposalViewComponent', () => {
    let fixture: ComponentFixture<AdminProposalViewComponent>;

    function textOf(qaId: string): string {
        return fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`))?.nativeElement.textContent.trim() ?? '';
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
});
