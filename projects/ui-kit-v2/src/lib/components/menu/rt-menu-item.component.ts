import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { mergeMap, Observable, Subject } from 'rxjs';

import { translateSignal } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtDialogService } from '../dialog/rt-dialog.service';
import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtMenuConfirmDialogComponent } from './rt-menu-confirm-dialog.component';
import { RT_MENU_SELECT_EVENT, IRtMenu } from './rt-menu.model';

const BEM_BLOCK: string = 'rt-menu-item';

/**
 * Пункт меню `rt-menu`: иконка (опц.) + лейбл. Кликабелен и активируется с
 * клавиатуры (Enter/Space). Выбор пункта эмитит `(selected)` для потребителя
 * и всплывающе диспатчит DOM-событие `rtMenuSelect`, по которому `rt-menu`
 * закрывается. `disabled` блокирует и `(selected)`, и закрытие.
 *
 * Tooltip — через host-директиву `RtTooltipDirective` (`tooltip` маппится в
 * `rtTooltip`): полезно показать причину недоступности на `disabled`-пункте.
 *
 * Деструктивный пункт может требовать подтверждения: задайте `confirmMessage`
 * (опц. `confirmTitle` / `confirmLabel` / `confirmTone`) — тогда по выбору
 * сперва открывается центрированная confirm-модалка, и `(selected)` эмитится
 * только после подтверждения. Модалка (а не popover) нужна потому, что панель
 * `rt-menu` сама в CDK Overlay; меню остаётся открытым под backdrop'ом, пока
 * пользователь решает.
 *
 * `ViewEncapsulation.None`; стили префиксованы `.rt-menu-item`. Host несёт
 * BEM-класс блока (template-`<ng-container rtBlock>` даёт контекст для `rtElem`,
 * но класс на comment-node не вешает — см. host-class паттерн rt-icon-button).
 */
@Component({
    selector: 'rt-menu-item',
    templateUrl: './rt-menu-item.component.html',
    styleUrl: './rt-menu-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
    ],
    hostDirectives: [
        {
            directive: RtTooltipDirective,
            inputs: ['rtTooltip: tooltip'],
        },
    ],
    host: {
        class: BEM_BLOCK,
        role: 'menuitem',
        '[class.rt-menu-item--danger]': 'danger()',
        '[class.rt-menu-item--disabled]': 'disabled()',
        '[attr.aria-disabled]': "disabled() ? 'true' : null",
        '[attr.tabindex]': 'disabled() ? null : 0',
        '(click)': 'onActivate($event)',
        '(keydown.enter)': 'onKey($event)',
        '(keydown.space)': 'onKey($event)',
    },
})
export class RtMenuItemComponent {
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #dialogService: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #confirmRequestSource: Subject<IRtMenu.ConfirmData> = new Subject<IRtMenu.ConfirmData>();

    readonly #t_uiConfirm: Signal<string> = translateSignal('rtKit.uiConfirm');
    readonly #t_uiCancel: Signal<string> = translateSignal('rtKit.uiCancel');

    /** Иконка слева от лейбла. `null` — без иконки. */
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Текст пункта. */
    public readonly label: InputSignal<string> = input<string>('');

    /** Деструктивный пункт (например «Удалить») — красный текст/иконка. */
    public readonly danger: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Недоступный пункт — приглушён, не эмитит `(selected)` и не закрывает меню. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Текст confirm-модалки. Непустое значение включает подтверждение: по выбору
     * пункта открывается модалка, и `(selected)` эмитится только после согласия.
     */
    public readonly confirmMessage: InputSignal<string> = input<string>('');

    /** Заголовок confirm-модалки (опц.). */
    public readonly confirmTitle: InputSignal<string | null> = input<string | null>(null);

    /** Лейбл подтверждающей кнопки в модалке. */
    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly confirmLabel: InputSignal<string> = input<string>('');

    /** Лейбл кнопки отмены в модалке. */
    public readonly confirmCancelLabel: InputSignal<string> = input<string>('');

    /** Тон подтверждающей кнопки в модалке. */
    public readonly confirmTone: InputSignal<IRtMenu.ConfirmTone> = input<IRtMenu.ConfirmTone>('danger');

    /** Пункт выбран (клик/Enter/Space и не `disabled`; после подтверждения, если задано). */
    public readonly selected: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Подписка на результат confirm-модалки объявлена один раз: #openConfirm
        // эмитит данные модалки, mergeMap открывает её и ждёт afterClosed()
        // (одноразовый стрим — комплитится при закрытии модалки).
        this.#confirmRequestSource
            .pipe(
                mergeMap((data: IRtMenu.ConfirmData): Observable<boolean | undefined> =>
                    this.#dialogService
                        .open<RtMenuConfirmDialogComponent, IRtMenu.ConfirmData, boolean>(RtMenuConfirmDialogComponent, { data })
                        .afterClosed()
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((confirmed: boolean | undefined = false): void => {
                if (confirmed === true) {
                    this.#commitSelection();
                }
            });
    }

    protected onActivate(event: Event): void {
        if (this.disabled()) {
            // Гасим, чтобы клик по disabled-пункту не «протёк» наружу.
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        const message: string = this.confirmMessage().trim();
        if (message !== '') {
            // Не закрываем меню сразу: оно остаётся открытым под backdrop'ом
            // модалки, чтобы пункт пережил решение пользователя (отмена → меню
            // снова видно). Подтверждение коммитит выбор.
            this.#openConfirm(message);
            return;
        }
        this.#commitSelection();
    }

    protected onKey(event: Event): void {
        // Space иначе проскроллит страницу — гасим дефолт перед активацией.
        event.preventDefault();
        this.onActivate(event);
    }

    #openConfirm(message: string): void {
        const data: IRtMenu.ConfirmData = {
            message,
            title: this.confirmTitle(),
            confirmLabel: this.confirmLabel() || this.#t_uiConfirm(),
            cancelLabel: this.confirmCancelLabel() || this.#t_uiCancel(),
            tone: this.confirmTone(),
        };
        // Открытие модалки и подписка на результат — в конструкторном стриме
        // (см. #confirmRequestSource); здесь только эмит данных модалки.
        this.#confirmRequestSource.next(data);
    }

    #commitSelection(): void {
        this.selected.emit();
        // Закрыть родительское меню: событие всплывает к панели rt-menu в overlay.
        this.#elementRef.nativeElement.dispatchEvent(new CustomEvent(RT_MENU_SELECT_EVENT, { bubbles: true }));
    }
}
