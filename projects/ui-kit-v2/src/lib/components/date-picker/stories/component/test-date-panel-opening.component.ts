import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, signal, viewChild, WritableSignal } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtBottomSheetComponent } from '../../../bottom-sheet/rt-bottom-sheet.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtPopoverDirective } from '../../../popover/rt-popover.directive';
import { RtDatePanelComponent } from '../../panel/rt-date-panel.component';
import { IRtDatePicker } from '../../rt-date-picker.model';

/** «Сегодня» витрины, то же, что в матрице панели. */
const STORY_NOW: Date = new Date(2026, 2, 10, 10, 37);

/** Где стоит панель: у каждого места своя история. */
export type TDatePanelOpeningPlace = 'popover' | 'icon' | 'sheet';

/**
 * Панель без текстового поля: кнопка открывает выбор, готовое значение подписывает кнопку. Ни
 * поповера, ни шторки панель сама не держит, и закрывает их потребитель по событию `closed`.
 *
 * Пары наборов у показа нет: оверлей и шторка стоят поверх окна и оставили бы половины пустыми.
 * Пары наборов и тем у самой панели показывают соседние истории `DatePanel`.
 *
 * Шторка прибита к окну и заняла бы всю его ширину, поэтому она стоит в ящике ширины телефона:
 * свойство `contain: paint` делает ящик её блоком-контейнером.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-date-panel-opening',
    templateUrl: './test-date-panel-opening.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        DatePipe,

        // components
        RtBottomSheetComponent,
        RtButtonDirective,
        RtDatePanelComponent,
        RtIconButtonComponent,
        RtPopoverDirective,
    ],
})
export class TestRtDatePanelOpeningComponent {
    protected readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    public place: TDatePanelOpeningPlace = 'popover';
    public type: IRtDatePicker.Type = 'datetime-local';
    public value: string = '2026-03-15T09:30';
    public isTodayButtonShown: boolean = true;
    public min: string | null = null;

    /** Заголовок шторки: его даёт потребитель через слот `[sheetHeader]`, у панели своего нет. */
    public sheetTitle: string = '';

    /** Подпись кнопки-иконки для читалки экрана. */
    public readonly iconLabel: string = 'Выбрать дату и время';

    public readonly now: Date = STORY_NOW;
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly sheetOpen: WritableSignal<boolean> = signal<boolean>(false);

    /** Поверхность поповера: у самой панели её нет, и даёт её потребитель. */
    public readonly surface: string =
        'border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-overlay-select-radius); ' +
        'background-color: var(--rt-color-bg-surface); box-shadow: var(--rt-overlay-select-shadow)';

    /** Экран телефона: шторка считает своё место от него, а не от окна. */
    public readonly phone: string =
        'box-sizing: border-box; position: relative; contain: paint; inline-size: 22.5rem; block-size: 45rem; padding: 1rem';

    public closePopover(): void {
        this.popover()?.close();
    }
}
