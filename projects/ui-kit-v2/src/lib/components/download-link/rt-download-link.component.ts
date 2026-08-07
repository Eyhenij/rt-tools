import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtKitLabelParams, rtKitLabel } from '../../i18n';
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
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDownloadLinkComponent {
    /**
     * Подпись для скринридера: имя файла подставляется в неё, поэтому карты
     * подписей ей мало — параметр приходит из входа.
     */
    protected readonly downloadAriaLabel: Signal<string> = rtKitLabel(
        'uiDownloadFile',
        computed((): RtKitLabelParams => ({ name: this.label() }))
    );

    public readonly label: InputSignal<string> = input.required<string>();

    public readonly downloadClick: OutputEmitterRef<void> = output<void>();

    protected onClick(): void {
        this.downloadClick.emit();
    }
}
