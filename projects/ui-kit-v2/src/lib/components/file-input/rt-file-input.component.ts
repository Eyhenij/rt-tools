import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

import { translateSignal } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtButtonDirective } from '../button/rt-button.directive';
import { RtFileCardComponent } from '../file-card/rt-file-card.component';
import { RtFileListComponent } from '../file-list/rt-file-list.component';
import { RtFormControlBase } from '../form-control/rt-form-control.base';

const BEM_BLOCK: string = 'rt-file-input';

/**
 * Поле выбора файлов: кнопка «выбрать» + список выбранных файлов карточками
 * `rt-file-card` (иконка типа, имя, размер, удаление). Скрывает нативный
 * `<input type="file">`, value хранит как `File[]` (одиночный режим = максимум
 * один файл). CVA через общий `RtFormControlBase`. Read-only представление —
 * имена файлов через запятую.
 *
 * Без drag-drop (MVP). `accept` пробрасывается в нативный input, `multiple`
 * включает множественный выбор.
 */
@Component({
    selector: 'rt-file-input',
    templateUrl: './rt-file-input.component.html',
    styleUrls: ['./rt-file-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtButtonDirective,
        RtFileCardComponent,
        RtFileListComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtFileInputComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-file-input--disabled]': 'isDisabled()',
        '[class.rt-file-input--invalid]': 'isInvalid()',
        '[class.rt-file-input--readonly]': 'isReadonly()',
    },
})
export class RtFileInputComponent extends RtFormControlBase<File[]> {
    readonly #t_uiChooseFile: Signal<string> = translateSignal('rtKit.uiChooseFile');

    protected readonly fileEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fileEl');

    protected readonly buttonText: Signal<string> = computed((): string => this.buttonLabel() || this.#t_uiChooseFile());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value().length > 0);

    public readonly displayText: Signal<string> = computed((): string =>
        this.value()
            .map((f: File): string => f.name)
            .join(', ')
    );

    public readonly multiple: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly accept: InputSignal<string | null> = input<string | null>(null);

    /**
     * Выбор каталога целиком вместо отдельных файлов. Браузер отдаёт
     * относительные пути (`webkitRelativePath`), по ним вызывающая сторона
     * восстанавливает структуру — иначе пользователю пришлось бы выбирать
     * десятки файлов по одному.
     */
    public readonly directory: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly buttonLabel: InputSignal<string> = input<string>('');

    protected getEmptyValue(): File[] {
        return [];
    }

    protected focusAfterClear(): void {
        // Скрытый native input фокусировать бессмысленно — фокус остаётся на кнопке.
    }

    protected openPicker(): void {
        if (this.isDisabled()) {
            return;
        }
        this.fileEl()?.nativeElement.click();
    }

    protected onFiles(event: Event): void {
        const list: FileList | null = (event.target as HTMLInputElement).files;
        const files: File[] = list ? Array.from(list) : [];
        const next: File[] = this.multiple() ? files : files.slice(0, 1);
        this.value.set(next);
        this.emitChange(next);
        this.markTouched();
    }

    protected removeFile(index: number): void {
        if (this.isDisabled()) {
            return;
        }
        const next: File[] = this.value().filter((_: File, i: number): boolean => i !== index);
        this.value.set(next);
        this.emitChange(next);
        // Сбрасываем native input, иначе повторный выбор того же файла не сработает.
        const el: HTMLInputElement | undefined = this.fileEl()?.nativeElement;
        if (el) {
            el.value = '';
        }
    }
}
