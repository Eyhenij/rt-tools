import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    linkedSignal,
    output,
    OutputEmitterRef,
    Signal,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IBlock, titledOfContent } from '@rt-tools/cms-contract';
import { CMS_LABELS, TCmsLabelKey, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtFieldComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

import { CmsEditableDirective } from '../cms-editable.directive';

const BEM_BLOCK: string = 'rt-cms-editor-titled';

/**
 * A block with a title and text: a note, a quote, an accordion. The title is a plain field, the text
 * is editable HTML, over whose selection the style menu pops up.
 */
@Component({
    selector: 'rt-cms-editor-titled',
    templateUrl: './cms-editor-titled.component.html',
    styleUrl: './cms-editor-titled.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtFieldComponent,
        RtInputComponent,

        // components
        CmsEditableDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorTitledComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    /** The block value; the own edit that came back as the input is not read again. */
    protected readonly value: WritableSignal<IBlock.Content.Note> = linkedSignal<string, IBlock.Content.Note>({
        source: () => this.content(),
        computation: (content: string, previous?: { value: IBlock.Content.Note }) =>
            previous && content === JSON.stringify(previous.value) ? previous.value : titledOfContent(content),
    });

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly titleLabel: InputSignal<TCmsLabelKey> = input<TCmsLabelKey>('editorTitle');
    public readonly textPlaceholder: InputSignal<TCmsLabelKey> = input<TCmsLabelKey>('editorTextPlaceholder');
    public readonly contentChange: OutputEmitterRef<string> = output<string>();

    protected patch(change: Partial<IBlock.Content.Note>): void {
        const next: IBlock.Content.Note = { ...this.value(), ...change };
        this.value.set(next);
        this.contentChange.emit(JSON.stringify(next));
    }
}
