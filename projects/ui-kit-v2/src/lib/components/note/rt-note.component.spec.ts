import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, renderedText } from '../../../testing/rt-kit-testing';
import { RtNoteComponent } from './rt-note.component';

/** Заметка рисует только проекцию — без host-обёртки проверять нечего. */
@Component({
    selector: 'rt-note-host',
    template: `
        <rt-note>
            Тариф меняется
            <strong>со следующего месяца</strong>
            .
        </rt-note>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtNoteComponent],
})
class NoteHostComponent {}

describe('RtNoteComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(createRtFixture(RtNoteComponent))).toContain('rt-note');
    });

    it('объявлен вспомогательной заметкой, а не сообщением тревоги', (): void => {
        // `role="note"` против `role="alert"`: заметка не перебивает чтение
        // экрана. Громкое цветное уведомление — это `rt-message`.
        expect((createRtFixture(RtNoteComponent).nativeElement as HTMLElement).getAttribute('role')).toBe('note');
    });

    it('проецирует содержимое как есть, сохраняя разметку внутри', (): void => {
        const fixture: ComponentFixture<NoteHostComponent> = createRtFixture(NoteHostComponent);

        expect(renderedText(fixture)).toContain('Тариф меняется со следующего месяца.');
        expect(el(fixture, 'rt-note strong')).not.toBeNull();
    });

    it('своей обёртки вокруг проекции не добавляет', (): void => {
        // Блок объявлен на `ng-container`: разметка потребителя остаётся прямым
        // потомком host-а, и раскладка на нём (flex/grid) продолжает работать.
        const fixture: ComponentFixture<NoteHostComponent> = createRtFixture(NoteHostComponent);

        expect(el(fixture, 'rt-note')?.nativeElement.querySelector('.rt-note')).toBeNull();
    });
});
