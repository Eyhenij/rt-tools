import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    computed,
    Component,
    contentChild,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    isDevMode,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { mergeMap, Observable, Subject } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtMenuConfirmDialogComponent } from './rt-menu-confirm-dialog.component';
import { RtMenuItemIconDirective } from './rt-menu-item-icon.directive';
import { menuItemIconName, unpairedGlyph } from './rt-menu-item.logic';
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
        ModDirective,
        NgTemplateOutlet,
        RouterLink,
    ],
    hostDirectives: [
        {
            directive: RtTooltipDirective,
            inputs: ['rtTooltip: tooltip'],
        },
    ],
    host: {
        class: BEM_BLOCK,
        '[attr.role]': "isLink() ? 'none' : 'menuitem'",
        '[class.rt-menu-item--danger]': 'danger()',
        '[class.rt-menu-item--success]': 'success()',
        '[class.rt-menu-item--disabled]': 'disabled()',
        '[class.rt-menu-item--current]': 'current()',
        '[class.rt-menu-item--link]': 'isLink()',
        '[attr.aria-current]': "current() && !isLink() ? 'true' : null",
        '[attr.aria-disabled]': "disabled() && !isLink() ? 'true' : null",
        '[attr.tabindex]': 'disabled() || isLink() ? null : 0',
        '(click)': 'onActivate($event)',
        '(auxclick)': 'onAuxClick($event)',
        '(keydown.enter)': 'onKey($event)',
        '(keydown.space)': 'onKey($event)',
    },
})
export class RtMenuItemComponent {
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #dialogService: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #confirmRequestSource: Subject<IRtMenu.ConfirmData> = new Subject<IRtMenu.ConfirmData>();

    readonly #t_uiConfirm: Signal<string> = rtKitLabel('uiConfirm');
    readonly #t_uiCancel: Signal<string> = rtKitLabel('uiCancel');

    /** Свой значок приложения — `<ng-template rtMenuItemIcon>` внутри пункта. */
    protected readonly ownIcon: Signal<RtMenuItemIconDirective | undefined> = contentChild(RtMenuItemIconDirective);

    /** Значок пункта: свой `icon`, а без него — пара имени Material из перечня кита. */
    protected readonly iconName: Signal<IRtIcon.Name | null> = computed((): IRtIcon.Name | null =>
        menuItemIconName(this.icon(), this.glyph())
    );

    /** Пункт — ссылка: задан `link`. Роль пункта меню и фокус тогда несёт ссылка внутри. */
    protected readonly isLink: Signal<boolean> = computed((): boolean => this.link() !== null);

    /** Адрес для ссылки: у недоступного пункта его нет, и ссылка не переходит. */
    protected readonly linkTarget: Signal<RouterLink['routerLink']> = computed((): RouterLink['routerLink'] =>
        this.disabled() ? null : this.link()
    );

    /** Иконка слева от лейбла. `null` — без иконки. */
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Текст пункта. */
    public readonly label: InputSignal<string> = input<string>('');

    /** Деструктивный пункт (например «Удалить») — красный текст/иконка. */
    public readonly danger: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пункт-согласие (например «Принять») — зелёный текст и иконка, как тон `success` пунктов первого кита. */
    public readonly success: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Имя значка Material, как его пишет пункт меню первого кита (`check_circle`). Рисует его набор
     * кита через перечень соответствий; `icon` сильнее, а имя без пары рисует пункт без значка.
     */
    public readonly glyph: InputSignal<string | null> = input<string | null>(null);

    /**
     * Залитый значок вместо контурного — как значки пунктов меню первого кита. Уходит в `fill`
     * значка: действует в материальном наборе, свой набор рисует значок одним рисунком. Свой
     * значок `rtMenuItemIcon` приложение рисует само, и заливка его не касается.
     */
    public readonly fill: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пункт — нынешнее значение выбора, который открыл меню: подсвечен фоном и объявлен скринридеру. */
    public readonly current: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
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

    /**
     * Команды маршрута приложения, как у `routerLink`. Задан — пункт рисует ссылку с `href`: Enter и
     * клик переходят по ней, а Ctrl/Cmd-click, Shift-click и средняя кнопка открывают новую вкладку
     * или окно силами браузера. Меню закрывается во всех этих случаях; подтверждение не спрашивается.
     */
    public readonly link: InputSignal<RouterLink['routerLink']> = input<RouterLink['routerLink']>(null);

    /** Пункт выбран (клик/Enter/Space и не `disabled`; после подтверждения, если задано). */
    public readonly selected: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Имя Material без пары рисует пункт без значка, и пропуск без предупреждения не заметен.
        if (isDevMode()) {
            effect((): void => {
                const glyph: string | null = unpairedGlyph(this.icon(), this.glyph(), this.ownIcon() !== undefined);
                if (glyph !== null) {
                    // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
                    console.warn(
                        `rt-menu-item «${this.label()}»: у значка Material «${glyph}» нет пары в перечне кита. ` +
                            'Задайте icon или свой значок через <ng-template rtMenuItemIcon>.'
                    );
                }
            });
        }

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
        if (message !== '' && !this.isLink()) {
            // Не закрываем меню сразу: оно остаётся открытым под backdrop'ом
            // модалки, чтобы пункт пережил решение пользователя (отмена → меню
            // снова видно). Подтверждение коммитит выбор.
            this.#openConfirm(message);
            return;
        }
        this.#commitSelection();
    }

    protected onKey(event: Event): void {
        if (this.isLink()) {
            this.#onLinkKey(event);
            return;
        }
        // Space иначе проскроллит страницу — гасим дефолт перед активацией.
        event.preventDefault();
        this.onActivate(event);
    }

    /** Средняя кнопка не даёт `click`: вкладку открывает браузер, а меню закрываем сами. */
    protected onAuxClick(event: MouseEvent): void {
        if (this.isLink() && event.button === 1 && !this.disabled()) {
            this.#commitSelection();
        }
    }

    /**
     * Enter на ссылке браузер сам превращает в `click`, и переход делает `routerLink`. Пробел ссылка
     * не нажимает — его переводим в тот же `click`, погасив прокрутку страницы.
     */
    #onLinkKey(event: Event): void {
        if (event instanceof KeyboardEvent && event.key === ' ') {
            event.preventDefault();
            this.#elementRef.nativeElement.querySelector<HTMLElement>('a')?.click();
        }
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
