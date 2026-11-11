import { AbstractControl, FormControl } from '@angular/forms';

import { rtCaretToEnd } from '@rt-tools/ui-kit-v2';

/** Поле ответа в трёх видах: вид мессенджера, компактный композер и обычная textarea. */
export interface IRtChatReplyFields {
    readonly messenger: boolean;
    readonly rich: boolean;
    readonly prompt: { text: () => string; setDraft: (text: string) => void } | undefined;
    readonly composer: { draftText: () => string; setDraft: (text: string) => void } | undefined;
    readonly message: FormControl<string>;
    readonly textarea: HTMLTextAreaElement | undefined;
}

/** Текст поля того вида, который сейчас на экране. */
export function rtChatReadDraft(fields: IRtChatReplyFields): string {
    if (fields.messenger) {
        return fields.prompt?.text() ?? '';
    }
    if (fields.rich) {
        return fields.composer?.draftText() ?? '';
    }
    return fields.message.value;
}

/** Заменяет текст поля того вида, который сейчас на экране, и ставит курсор в конец. */
export function rtChatWriteDraft(fields: IRtChatReplyFields, text: string): void {
    if (fields.messenger) {
        fields.prompt?.setDraft(text);
        return;
    }
    if (fields.rich) {
        fields.composer?.setDraft(text);
        return;
    }
    fields.message.setValue(text);
    if (fields.textarea) {
        rtCaretToEnd(fields.textarea);
    }
}

/**
 * `formControlName`-инпуты игнорируют атрибут `disabled`, поэтому состояние ввода держит сама
 * форма: блок при рефреше треда или отправке in-flight.
 */
export function rtChatSyncReplyDisabled(form: AbstractControl, blocked: boolean): void {
    if (blocked && form.enabled) {
        form.disable({ emitEvent: false });
        return;
    }
    if (!blocked && form.disabled) {
        form.enable({ emitEvent: false });
    }
}
