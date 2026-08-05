import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef, ViewEncapsulation } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';

const BEM_BLOCK: string = 'rt-download-link';

@Component({
    selector: 'rt-download-link',
    templateUrl: './rt-download-link.component.html',
    styleUrl: './rt-download-link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDownloadLinkComponent {
    public readonly label: InputSignal<string> = input.required<string>();

    public readonly downloadClick: OutputEmitterRef<void> = output<void>();

    protected onClick(): void {
        this.downloadClick.emit();
    }
}
