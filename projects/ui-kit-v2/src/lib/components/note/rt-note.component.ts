import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-note';

/**
 * Тихая информационная заметка-callout для асайдов и форм: приглушённый текст
 * на subtle-фоне, без иконки и severity-цвета. Назначение — пояснить контекст
 * (предупреждения, подсказки, контекстные примечания),
 * не перебивая основной контент.
 *
 * Семантика — `role="note"` (ancillary-контент). Это НЕ alert: для громких
 * цветных уведомлений с severity/иконкой/закрытием используйте `rt-message`.
 *
 * Контент проецируется через `<ng-content />` — допустимы инлайн-теги
 * (`<strong>`, `<a>`) и control-flow (`@if`) внутри.
 */
@Component({
    selector: 'rt-note',
    templateUrl: './rt-note.component.html',
    styleUrl: './rt-note.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
    ],
    host: {
        // Block-класс на host (BlockDirective пропускает comment-ноду ng-container),
        // role — на том же элементе: rt-note самодостаточен, без внутреннего контейнера.
        class: BEM_BLOCK,
        role: 'note',
    },
})
export class RtNoteComponent {}
