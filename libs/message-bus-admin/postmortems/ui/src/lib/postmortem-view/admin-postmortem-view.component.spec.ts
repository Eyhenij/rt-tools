import { DebugElement } from '@angular/core';
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

    /**
     * Значение свойства лежит внутри строки кита и носит её признак: свой признак у панели
     * теперь на самой строке, а не на теге значения.
     */
    function textOf(qaId: string): string {
        const own: DebugElement | null = fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`));
        const value: DebugElement | null = own?.query(By.css('[qa-dataid="detail-row-value"]')) ?? null;

        return (value ?? own)?.nativeElement.textContent.trim() ?? '';
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

    it('текст разбора показан разметкой: заголовок — заголовком, остальное — абзацем', () => {
        show(entityOf({ text: '# Разбор\n\nупало ночью' }));

        expect(
            fixture.debugElement
                .query(By.css('[qa-dataid="postmortem-text"] [qa-dataid="markdown-heading"]'))
                .nativeElement.textContent.trim()
        ).toBe('Разбор');
        expect(
            fixture.debugElement
                .query(By.css('[qa-dataid="postmortem-text"] [qa-dataid="markdown-paragraph"]'))
                .nativeElement.textContent.trim()
        ).toBe('упало ночью');
    });

    it('сырой HTML, приехавший с дерева, показан текстом и в разметку страницы не попадает', () => {
        show(entityOf({ text: '<script>alert(1)</script><b>жирным</b>' }));

        expect(textOf('postmortem-text')).toBe('<script>alert(1)</script><b>жирным</b>');
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortem-text"] script'))).toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortem-text"] b'))).toBeNull();
    });

    it('SC-MB-219 — текста из одних пробелов панель разделом не показывает', () => {
        show(entityOf({ text: '   \n  \n' }));

        // Сначала — что найдено то самое место: панель поднята и свойства записи на ней стоят,
        // а раздела с текстом нет
        expect(textOf('postmortem-file')).toBe('2026-08-14-incident.md');
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortem-text"]'))).toBeNull();
        expect(fixture.debugElement.queryAll(By.css('rt-aside-section')).length).toBe(1);
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
