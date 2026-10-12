import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';

const BEM_BLOCK: string = 'rt-prompt-suggestion';

/**
 * Карточка готового вопроса на пустом экране ассистента: подпись слева, стрелка справа на
 * одинаковом отступе. Нажатие сообщает текст подсказки наружу — что с ним делать, решает
 * приложение.
 */
@Component({
    selector: 'rt-prompt-suggestion',
    templateUrl: './rt-prompt-suggestion.component.html',
    styleUrl: './rt-prompt-suggestion.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtPromptSuggestionComponent {
    /** Текст вопроса: он и на карточке, и в выходе. */
    public readonly label: InputSignal<string> = input.required<string>();

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Карточку нажали; значение — текст вопроса. */
    public readonly picked: OutputEmitterRef<string> = output<string>();

    protected onClick(): void {
        this.picked.emit(this.label());
    }
}
