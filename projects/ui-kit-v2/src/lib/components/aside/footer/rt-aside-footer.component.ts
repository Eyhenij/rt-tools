import {
    booleanAttribute,
    contentChildren,
    effect,
    inject,
    input,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { BreakpointsService, IButton, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';

const BEM_BLOCK: string = 'rt-aside-footer';

/**
 * Раскладка подвала. `between` — «Закрыть» в рамке слева, позитивный глагол залитый и без значка
 * справа. `start` — как в панели подключения службы: позитивный глагол первым, со своим значком,
 * «Закрыть» текстом сразу за ним, обе у левого края.
 */
export type TRtAsideFooterLayout = 'between' | 'start';

/** Вид кнопки слота `[asidePrimary]` в раскладке `between`: залитая, основного цвета, без значка. */
const PRIMARY_LOOK: IButton.PlaceLook = { appearance: 'filled', theme: 'primary', icon: null };

/** Вид кнопки слота `[asidePrimary]` в раскладке `start`: залитая, основного цвета, значок свой. */
const PRIMARY_START_LOOK: IButton.PlaceLook = { appearance: 'filled', theme: 'primary' };

/** Вид кнопки по слоту, в котором она стоит сама или внутри его обёртки; вне слотов вида нет. */
function slotLook(host: HTMLElement | undefined, dismissLook: IButton.PlaceLook, primaryLook: IButton.PlaceLook): IButton.PlaceLook | null {
    if (host?.closest('[asideDismiss]')) {
        return dismissLook;
    }
    if (host?.closest('[asidePrimary]')) {
        return primaryLook;
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
    imports: [BlockDirective, ElemDirective, NgTemplateOutlet],
    host: {
        class: BEM_BLOCK,
        '[class.rt-aside-footer--start]': "layout() === 'start'",
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

    /** Раскладка кнопок: `between` по умолчанию, `start` — панель подключения службы. */
    public readonly layout: InputSignal<TRtAsideFooterLayout> = input<TRtAsideFooterLayout>('between');

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
            const start: boolean = this.layout() === 'start';
            const dismissLook: IButton.PlaceLook = {
                appearance: start ? 'text' : 'outlined',
                theme: 'secondary',
                ...(this.#phone() && this.phoneCloseLabel() ? { label: this.#closeLabel() } : {}),
            };
            const primaryLook: IButton.PlaceLook = start ? PRIMARY_START_LOOK : PRIMARY_LOOK;

            this.buttons().forEach((button: RtButtonDirective, index: number): void => {
                button.placeLook.set(slotLook(hosts[index]?.nativeElement, dismissLook, primaryLook));
            });
        });
    }
}
