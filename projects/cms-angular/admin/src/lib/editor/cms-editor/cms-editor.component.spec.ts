import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { of } from 'rxjs';

import { EBlockType, IBlock, parseContentBody, serializeContentBody } from '@rt-tools/cms-contract';

import { CMS_EDITOR_CONTENT_SOURCE, CMS_EDITOR_IMAGE_PICKER, ICmsEditorContentSource, ICmsEditorImagePicker } from '../cms-editor.tokens';
import { CmsEditorComponent } from './cms-editor.component';

const CONTENT_SOURCE: ICmsEditorContentSource = {
    contentTypes: () => of([]),
    search: () => of([]),
};
const IMAGE_PICKER: ICmsEditorImagePicker = { pick: () => of(undefined) };
const FIRST_PARAGRAPH: string = 'First <b>paragraph</b>';

@Component({
    selector: 'rt-cms-editor-host',
    template: '<rt-cms-editor [ngModel]="body()" (ngModelChange)="body.set($event)" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, CmsEditorComponent],
})
class EditorHostComponent {
    public readonly body: WritableSignal<string> = signal<string>(
        serializeContentBody([{ id: 'p1', type: EBlockType.Paragraph, content: FIRST_PARAGRAPH }])
    );
}

describe('the block editor', () => {
    it('SC-CMS-69 — the form body is drawn as blocks, and a new block goes back to the form as a string', async () => {
        TestBed.configureTestingModule({
            imports: [EditorHostComponent],
            providers: [
                { provide: CMS_EDITOR_CONTENT_SOURCE, useValue: CONTENT_SOURCE },
                { provide: CMS_EDITOR_IMAGE_PICKER, useValue: IMAGE_PICKER },
            ],
        });
        const fixture: ComponentFixture<EditorHostComponent> = TestBed.createComponent(EditorHostComponent);
        await fixture.whenStable();
        const page: HTMLElement = fixture.nativeElement as HTMLElement;

        const text: HTMLElement | null = page.querySelector('[qa-dataid="cms-editor-block-text"]');
        expect(text?.innerHTML).toBe(FIRST_PARAGRAPH);

        const addHeading: HTMLButtonElement | null = page.querySelector(`[qa-dataid="cms-editor-add"][data-type="${EBlockType.Heading2}"]`);
        expect(addHeading).not.toBeNull();
        addHeading?.click();
        await fixture.whenStable();

        const blocks: IBlock.Base[] = parseContentBody(fixture.componentInstance.body());
        expect(blocks.map((block: IBlock.Base) => block.type)).toEqual([EBlockType.Paragraph, EBlockType.Heading2]);
        expect(blocks[0].content).toBe(FIRST_PARAGRAPH);
        expect(page.querySelectorAll('rt-cms-editor-block')).toHaveLength(2);
        expect(page.querySelector('[qa-dataid="cms-editor-block-kind"]')?.textContent).toBe('Text');
    });
});
