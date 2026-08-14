import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtNoteComponent } from '../../rt-note.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входов у заметки нет вовсе — контролом служит сам текст, и
 * история целится сюда, а не в компонент кита. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-note',
    template: `
        <rt-note>{{ text }}</rt-note>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNoteComponent,
    ],
})
export class TestRtNoteComponent {
    public text: string = 'Тариф меняется со следующего месяца.';
}
