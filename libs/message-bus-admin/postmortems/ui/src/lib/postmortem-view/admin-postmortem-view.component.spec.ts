import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IPostmortem } from '@rt/message-bus-admin/postmortems/util';

import { AdminPostmortemViewComponent } from './admin-postmortem-view.component';

function entityOf(patch: Partial<IPostmortem.State> = {}): IPostmortem.State {
    return {
        id: 'p1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        file: '2026-08-14-incident.md',
        arrivedAt: new Date('2026-08-14T21:30:00.000Z'),
        updatedAt: new Date('2026-08-15T06:00:00.000Z'),
        text: '# Разбор',
        ...patch,
    };
}

describe('AdminPostmortemViewComponent', () => {
    let fixture: ComponentFixture<AdminPostmortemViewComponent>;

    function textOf(qaId: string): string {
        return fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`))?.nativeElement.textContent.trim() ?? '';
    }

    function show(entity: IPostmortem.State): void {
        fixture.componentRef.setInput('entity', entity);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [AdminPostmortemViewComponent] });

        fixture = TestBed.createComponent(AdminPostmortemViewComponent);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('поля записи названы деревом, файлом и двумя временами', () => {
        show(entityOf());

        expect(textOf('postmortem-tree')).toBe('Приёмник');
        expect(textOf('postmortem-file')).toBe('2026-08-14-incident.md');
        expect(textOf('postmortem-arrived')).not.toBe('');
        expect(textOf('postmortem-updated')).not.toBe('');
    });

    it('время показано днём и минутами, а не строкой ответа', () => {
        show(entityOf({ arrivedAt: new Date('2026-08-14T21:30:00.000Z') }));

        expect(textOf('postmortem-arrived')).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('времени, которого нет, ячейка не выдаёт за настоящее', () => {
        show(entityOf({ updatedAt: new Date('') }));

        expect(textOf('postmortem-updated')).toBe('—');
    });

    it('текст разбора показан целиком', () => {
        show(entityOf({ text: '# Разбор\nупало ночью' }));

        expect(textOf('postmortem-text')).toBe('# Разбор\nупало ночью');
    });

    it('разметка, приехавшая с дерева, показана текстом и в разметку страницы не попадает', () => {
        show(entityOf({ text: '<script>alert(1)</script><b>жирным</b>' }));

        expect(textOf('postmortem-text')).toBe('<script>alert(1)</script><b>жирным</b>');
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortem-text"] script'))).toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortem-text"] b'))).toBeNull();
    });
});
