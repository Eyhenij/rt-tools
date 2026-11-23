import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtSheetTemplateContext, RtBottomSheetComponent } from '@rt-tools/ui-kit-v2/bottom-sheet';

const BEM_BLOCK: string = 'rt-popover-sheet';

let nextTitleId: number = 0;

function takeTitleId(): string {
    nextTitleId += 1;
    return `rt-popover-sheet-title-${nextTitleId}`;
}

/**
 * Панель выбора `[rtPopover]` в нижней шторке кита — так её открывает директива на узком экране.
 *
 * Шаблон панели тот же, что у панели рядом с триггером: шторка лишь даёт ему место во всю ширину
 * экрана, заголовок и ручку. Ширина, взятая у триггера, сюда не доходит — панель тянется по шторке.
 * Закрытие подложкой и ручкой уходит наружу одним событием `dismissed`: директива закрывает по нему
 * панель так же, как по нажатию снаружи.
 */
@Component({
    selector: 'rt-popover-sheet',
    templateUrl: './rt-popover-sheet.component.html',
    styleUrl: './rt-popover-sheet.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // @angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtBottomSheetComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtPopoverSheetComponent {
    /** Идентификатор заголовка: на него ссылается имя диалога шторки. */
    protected readonly titleId: string = takeTitleId();
    protected readonly sheet: Signal<RtBottomSheetComponent> = viewChild.required(RtBottomSheetComponent);

    public readonly template: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);
    public readonly context: InputSignal<unknown> = input<unknown>(null);
    public readonly title: InputSignal<string> = input<string>('');
    public readonly open: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Шторка во всю высоту экрана: для содержимого, в котором человек печатает. */
    public readonly fullHeight: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Действие справа в шапке: шаблон с кнопкой. Пусто — действия нет. */
    public readonly action: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);
    /** Выбор изменён и не применён: шторка спрашивает перед закрытием. */
    public readonly unsaved: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Своя шапка шторки шаблоном. Пусто — шапка шторки с заголовком и действием. */
    public readonly header: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> = input<TemplateRef<IRtSheetTemplateContext> | null>(
        null
    );
    /** Свой подвал шторки шаблоном. Пусто — подвала нет. */
    public readonly footer: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> = input<TemplateRef<IRtSheetTemplateContext> | null>(
        null
    );

    public readonly dismissed: OutputEmitterRef<void> = output<void>();
    /** Человек ответил на вопрос «Применить»: следом придёт `dismissed`. */
    public readonly applyRequest: OutputEmitterRef<void> = output<void>();

    /** Escape, пойманный оверлеем шторки: с неприменённым выбором шторка спрашивает, а не закрывается. */
    public closeByEscape(): void {
        this.sheet().closeByEscape();
    }

    protected openChange(open: boolean): void {
        if (!open) {
            this.dismissed.emit();
        }
    }
}
