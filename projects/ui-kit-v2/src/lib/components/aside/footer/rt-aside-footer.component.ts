import {
    booleanAttribute,
    contentChildren,
    effect,
    inject,
    input,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { BreakpointsService, IButton, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';

const BEM_BLOCK: string = 'rt-aside-footer';

/** Вид кнопки слота `[asidePrimary]`: залитая, основного цвета, без значка. */
const PRIMARY_LOOK: IButton.PlaceLook = { appearance: 'filled', theme: 'primary', icon: null };

/** Вид кнопки по слоту, в котором она стоит сама или внутри его обёртки; вне слотов вида нет. */
function slotLook(host: HTMLElement | undefined, dismissLook: IButton.PlaceLook): IButton.PlaceLook | null {
    if (host?.closest('[asideDismiss]')) {
        return dismissLook;
    }
    if (host?.closest('[asidePrimary]')) {
        return PRIMARY_LOOK;
    }

    return null;
}

/**
 * Footer-слот для композиции внутри `<rt-aside>`. Две зоны через именованные
 * слоты: `[asideDismiss]` (слева — «Закрыть») и `[asidePrimary]` (справа —
 * единственный позитивный глагол: Сохранить / Отправить / Опубликовать, если
 * есть). Раскладка `justify-content: space-between`, кнопки стоят в одну строку
 * на любой ширине. Доменные/деструктивные действия в футер не кладём — они
 * проецируются иконками в `<rt-aside-header>` слот `[asideActions]`.
 *
 * Вид кнопок задаёт подвал, а не разметка потребителя: «Закрыть» в рамке темы
 * secondary, позитивный глагол залитый и без значка. На телефоне первая кнопка
 * подписана коротко — «Закрыть» из подписей кита. Кнопка может стоять в слоте
 * не сама, а внутри обёртки с атрибутом слота: так ставят подсказку на кнопку.
 *
 * Только две именованные зоны — безатрибутный контент НЕ проецируется (контент
 * без `asideDismiss`/`asidePrimary` не отрендерится).
 *
 * `ViewEncapsulation.None` — для единообразия с rt-aside.
 *
 * @example
 * \`\`\`html
 * <rt-aside-footer>
 *   <button rtButton asideDismiss label="Закрыть и не сохранять" (click)="onClose()"></button>
 *   <button rtButton asidePrimary label="Сохранить" (click)="save()"></button>
 * </rt-aside-footer>
 * \`\`\`
 */
@Component({
    selector: 'rt-aside-footer',
    templateUrl: './rt-aside-footer.component.html',
    styleUrl: './rt-aside-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideFooterComponent {
    readonly #phone: Signal<boolean> = inject(BreakpointsService).phone;
    readonly #closeLabel: Signal<string> = rtKitLabel('uiClose');

    /* Кнопки ищутся и внутри обёрток слота; оба списка идут в одном порядке документа. */
    protected readonly buttons: Signal<readonly RtButtonDirective[]> = contentChildren(RtButtonDirective, { descendants: true });
    protected readonly hosts: Signal<readonly ElementRef<HTMLElement>[]> = contentChildren(RtButtonDirective, {
        descendants: true,
        read: ElementRef,
    });

    /**
     * На телефоне кнопка слота `[asideDismiss]` читается «Закрыть»: так она названа у всех панелей.
     * `false` оставляет подпись потребителя — у панели фильтров эта кнопка «Сбросить», а не выход.
     */
    public readonly phoneCloseLabel: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(true, {
        transform: booleanAttribute,
    });

    constructor() {
        effect((): void => {
            const hosts: readonly ElementRef<HTMLElement>[] = this.hosts();
            const dismissLook: IButton.PlaceLook = {
                appearance: 'outlined',
                theme: 'secondary',
                ...(this.#phone() && this.phoneCloseLabel() ? { label: this.#closeLabel() } : {}),
            };

            this.buttons().forEach((button: RtButtonDirective, index: number): void => {
                button.placeLook.set(slotLook(hosts[index]?.nativeElement, dismissLook));
            });
        });
    }
}
