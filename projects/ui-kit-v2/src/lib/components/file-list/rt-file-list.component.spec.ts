import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, els, hostClasses, renderedText } from '../../../testing/rt-kit-testing';
import { RtFileListComponent } from './rt-file-list.component';

/** Список рисует только проекцию — без host-обёртки проверять нечего. */
@Component({
    selector: 'rt-file-list-host',
    template: `
        <rt-file-list>
            <div qa-dataid="host-file">Договор.pdf</div>
            <div qa-dataid="host-file">Акт.docx</div>
        </rt-file-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFileListComponent],
})
class FileListHostComponent {}

describe('RtFileListComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(createRtFixture(RtFileListComponent))).toContain('rt-file-list');
    });

    it('это только раскладка — своих входов и выходов у списка нет', (): void => {
        // Что показывать, решает потребитель: карточки файлов, ссылки, строки.
        // Список задаёт лишь отступы и перенос.
        const fixture: ComponentFixture<FileListHostComponent> = createRtFixture(FileListHostComponent);

        expect(els(fixture, '[qa-dataid="host-file"]').length).toBe(2);
        expect(renderedText(fixture)).toContain('Договор.pdf');
    });

    it('вокруг проекции обёртки не добавляет', (): void => {
        const fixture: ComponentFixture<FileListHostComponent> = createRtFixture(FileListHostComponent);

        expect((fixture.nativeElement as HTMLElement).querySelector('rt-file-list > .rt-file-list')).toBeNull();
    });

    it('пустой список рисуется без ошибок', (): void => {
        expect((createRtFixture(RtFileListComponent).nativeElement as HTMLElement).children.length).toBe(0);
    });
});
