import { TitleCasePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignalWithTransform,
    ModelSignal,
    OutputEmitterRef,
    input,
    model,
    output,
} from '@angular/core';
import { BlockDirective, ElemDirective } from '../../../bem';
import { transformArrayInput } from '../../../util';

@Component({
    selector: 'rtui-multi-button',
    templateUrl: 'rtui-multi-button.component.html',
    styleUrls: ['rtui-multi-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // pipes
        TitleCasePipe,
        // rt-tools
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiMultiButtonComponent {
    public actions: InputSignalWithTransform<string[], string[]> = input<string[], string[]>([], {
        transform: (value: string[]) => transformArrayInput(value),
    });
    public activeAction: ModelSignal<string> = model<string>('');

    public readonly changeActiveAction: OutputEmitterRef<string> = output<string>();

    public onSetActiveAction(action: string): void {
        if (action !== this.activeAction()) {
            this.activeAction.set(action);
            this.changeActiveAction.emit(this.activeAction());
        }
    }
}
