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
    untracked,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IBlock, prosConsOfContent } from '@rt-tools/cms-contract';
import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtButtonDirective, RtFieldComponent, RtIconButtonComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-editor-pros-cons';

/** A side of the comparison: pros or cons. */
export enum EProsConsSide {
    Pros = 'pros',
    Cons = 'cons',
}

/** The pros and cons block: two titles and two lists of rows. */
@Component({
    selector: 'rt-cms-editor-pros-cons',
    templateUrl: './cms-editor-pros-cons.component.html',
    styleUrl: './cms-editor-pros-cons.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtFieldComponent,
        RtIconButtonComponent,
        RtInputComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorProsConsComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly Side: typeof EProsConsSide = EProsConsSide;
    /**
     * The block value; the own edit that came back as the input is not read again. The default
     * titles are read untracked: a language change does not reset a block being edited.
     */
    protected readonly value: WritableSignal<IBlock.Content.ProsCons> = linkedSignal<string, IBlock.Content.ProsCons>({
        source: () => this.content(),
        computation: (content: string, previous?: { value: IBlock.Content.ProsCons }) => {
            if (previous && content === JSON.stringify(previous.value)) {
                return previous.value;
            }
            const labels: TCmsLabelMap = untracked(this.t);
            return prosConsOfContent(content, labels.prosConsPros, labels.prosConsCons);
        },
    });

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly contentChange: OutputEmitterRef<string> = output<string>();

    protected patch(change: Partial<IBlock.Content.ProsCons>): void {
        const next: IBlock.Content.ProsCons = { ...this.value(), ...change };
        this.value.set(next);
        this.contentChange.emit(JSON.stringify(next));
    }

    protected add(side: EProsConsSide): void {
        this.patch({ [side]: [...this.value()[side], ''] });
    }

    protected edit(side: EProsConsSide, position: number, text: string): void {
        this.patch({ [side]: this.value()[side].map((item: string, index: number) => (index === position ? text : item)) });
    }

    protected remove(side: EProsConsSide, position: number): void {
        this.patch({ [side]: this.value()[side].filter((_item: string, index: number) => index !== position) });
    }
}
