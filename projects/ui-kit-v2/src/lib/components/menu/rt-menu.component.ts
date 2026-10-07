import { FocusKeyManager } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtMenu } from './rt-menu.model';

const BEM_BLOCK: string = 'rt-menu';

const POSITION_BELOW_END: ConnectedPosition = {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
};
const POSITION_ABOVE_END: ConnectedPosition = {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -4,
};
const POSITION_BELOW_START: ConnectedPosition = {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
};
const POSITION_ABOVE_START: ConnectedPosition = {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -4,
};

/**
 * Dropdown-меню действий: icon-only триггер «…» + плавающая панель с пунктами
 * `rt-menu-item`, спроецированными через `<ng-content>`. Типовое применение —
 * per-row действия в конце строки `rt-table` (см. `[showRowActions]`).
 *
 * Движок — CDK `cdkConnectedOverlay` с прозрачным backdrop: авто-flip у края
 * viewport (4 fallback-позиции), backdrop-click и `(detach)` закрывают, Escape
 * закрывает через `(overlayKeydown)`. Панель не режется `overflow: hidden`
 * предками (таблицы, карточки), т.к. рендерится в overlay-контейнере.
 *
 * Выбор пункта закрывает меню: `rt-menu-item` всплывающе диспатчит DOM-событие
 * `rtMenuSelect`, которое панель ловит, — это переживает content-projection.
 *
 * @example
 * ```html
 * <rt-menu ariaLabel="Действия">
 *     <rt-menu-item icon="ico-edit" label="Редактировать" (selected)="edit()" />
 *     <rt-menu-item icon="ico-trash" label="Удалить" danger (selected)="remove()" />
 * </rt-menu>
 * ```
 */
@Component({
    selector: 'rt-menu',
    templateUrl: './rt-menu.component.html',
    styleUrl: './rt-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // @angular/cdk
        OverlayModule,

        // standalone components / directives
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-menu--open]': 'isOpen()',
    },
})
export class RtMenuComponent {
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #t_uiActions: Signal<string> = rtKitLabel('uiActions');

    /** Ход стрелками по пунктам открытой панели; у закрытой его нет. */
    #keyManager: FocusKeyManager<IRtMenu.Focusable> | null = null;

    protected readonly overlay: Signal<CdkConnectedOverlay> = viewChild.required(CdkConnectedOverlay);
    protected readonly trigger: Signal<CdkOverlayOrigin> = viewChild.required(CdkOverlayOrigin);

    protected readonly isOpen: WritableSignal<boolean> = signal<boolean>(false);

    /** Класс набора, найденный над меню при открытии: панель лежит вне контейнера с признаком. */
    protected readonly presetClasses: WritableSignal<string[]> = signal<string[]>([]);

    /** Классы панели: заданные входом и класс набора. */
    protected readonly panelClasses: Signal<string[]> = computed((): string[] => {
        const own: string | string[] = this.panelClass();
        return [...(Array.isArray(own) ? own : own.split(/\s+/).filter(Boolean)), ...this.presetClasses()];
    });

    protected readonly ariaText: Signal<string> = computed((): string => this.ariaLabel() || this.#t_uiActions());

    /** Fallback-цепочка позиций панели: первой идёт сторона по `align`. */
    protected readonly overlayPositions: Signal<ConnectedPosition[]> = computed((): ConnectedPosition[] =>
        this.align() === 'end'
            ? [POSITION_BELOW_END, POSITION_ABOVE_END, POSITION_BELOW_START, POSITION_ABOVE_START]
            : [POSITION_BELOW_START, POSITION_ABOVE_START, POSITION_BELOW_END, POSITION_ABOVE_END]
    );

    /** Иконка триггера. Default `ellipsis-h` («…» — три точки в конце строки). */
    public readonly icon: InputSignal<IRtIcon.Name> = input<IRtIcon.Name>('ellipsis-h');

    /** ARIA-метка триггера (icon-only кнопка) + текст tooltip'а. */
    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly ariaLabel: InputSignal<string> = input<string>('');

    /** Сторона раскрытия панели относительно триггера. */
    public readonly align: InputSignal<IRtMenu.Align> = input<IRtMenu.Align>('end');

    /**
     * Классы панели. Панель живёт поверх страницы, вне хоста меню, и признаки вида над хостом до неё
     * не доходят: семья, нарисованная своим набором, отдаёт его панели этим входом.
     */
    public readonly panelClass: InputSignal<string | string[]> = input<string | string[]>([]);

    /** Размер панели: компактная — у меню действий строки таблицы. */
    public readonly size: InputSignal<IRtMenu.Size> = input<IRtMenu.Size>('md');

    /** Триггер отключён — меню не открыть. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Панель открылась (`true`) или закрылась (`false`); повтор того же состояния не приходит. */
    public readonly openedChange: OutputEmitterRef<boolean> = output<boolean>();

    protected toggle(event: MouseEvent): void {
        // Клик по триггеру не должен активировать строку таблицы под ним.
        event.stopPropagation();
        this.#setOpen(!this.isOpen());
    }

    protected close(): void {
        this.#setOpen(false);
    }

    /**
     * Панель легла на страницу — фокус уходит на первый пункт, как у меню Material. Пункты берутся
     * из разметки панели, а не запросом компонентов: таблица кладёт их шаблоном приложения, и
     * запрос содержимого меню их не видит.
     */
    protected onAttach(): void {
        const pane: HTMLElement = this.overlay().overlayRef.overlayElement;

        // Тема куска `rtTheme` вокруг меню едет на коробку панели, как у поповера и подсказки:
        // панель лежит в конце страницы, и без этого меню из тёмной карточки рисовалось темой
        // страницы. Зовётся на каждом открытии — кусок вокруг кнопки мог смениться.
        carryThemeScope(pane, this.trigger().elementRef.nativeElement);

        const nodes: HTMLElement[] = Array.from(pane.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        const focusables: IRtMenu.Focusable[] = nodes.map((node: HTMLElement): IRtMenu.Focusable => ({
            disabled: node.getAttribute('aria-disabled') === 'true',
            focus: (): void => node.focus(),
        }));

        this.#keyManager = new FocusKeyManager<IRtMenu.Focusable>(focusables).withWrap().withHomeAndEnd();
        this.#keyManager.setFirstItemActive();
    }

    /** Выбранный пункт закрывает панель и возвращает фокус кнопке, откуда меню открыли. */
    protected onSelect(): void {
        this.close();
        this.#focusTrigger();
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
            this.#focusTrigger();
            return;
        }

        if (event.key === 'Tab') {
            // Tab уводит фокус дальше по порядку — панель за ним не остаётся. Панель лежит в конце
            // страницы, и без возврата Tab ушёл бы с неё в никуда: фокус ставится на кнопку, а
            // умолчание клавиши не отменяется — браузер ведёт его от кнопки к следующему, как у
            // меню Material.
            this.close();
            this.#focusTrigger();
            return;
        }

        this.#keyManager?.onKeydown(event);
    }

    #focusTrigger(): void {
        this.trigger().elementRef.nativeElement.querySelector('button')?.focus();
    }

    #setOpen(open: boolean): void {
        if (open !== this.isOpen()) {
            if (!open) {
                this.#keyManager?.destroy();
                this.#keyManager = null;
            }
            if (open) {
                this.presetClasses.set(materialPresetClassesOf(this.#host.nativeElement));
            }
            this.isOpen.set(open);
            this.openedChange.emit(open);
        }
    }
}
