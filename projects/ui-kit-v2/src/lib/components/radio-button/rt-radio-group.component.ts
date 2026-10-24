import {
    afterRenderEffect,
    computed,
    inject,
    input,
    ElementRef,
    signal,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { IRtRadioGroupHost, IRtRadioGroupMember, RT_RADIO_GROUP } from './rt-radio-group.token';

const BEM_BLOCK: string = 'rt-radio-group';

/** Клавиши, переводящие выбор на соседа: вперёд и назад. */
const NEXT_KEYS: ReadonlySet<string> = new Set<string>(['ArrowDown', 'ArrowRight']);
const PREV_KEYS: ReadonlySet<string> = new Set<string>(['ArrowUp', 'ArrowLeft']);

/** Раскладка группы: столбцом или строкой с переносом. */
export type TRtRadioGroupOrientation = 'vertical' | 'horizontal';

/**
 * Группа радиокнопок: `role="radiogroup"`, имя группы и ход стрелками.
 *
 * Стрелки переводят фокус и выбор на соседнюю включённую радиокнопку, по кругу; в порядке обхода по
 * Tab стоит одна радиокнопка группы — выбранная, а пока выбора нет, первая включённая. Выбор и форма
 * остаются у самих радиокнопок: группа значения не держит, и радиокнопки вне группы работают как
 * прежде.
 */
@Component({
    selector: 'rt-radio-group',
    templateUrl: './rt-radio-group.component.html',
    styleUrl: './rt-radio-group.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: RT_RADIO_GROUP, useExisting: RtRadioGroupComponent }],
    host: {
        class: BEM_BLOCK,
        role: 'radiogroup',
        '[class.rt-radio-group--horizontal]': "orientation() === 'horizontal'",
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-orientation]': 'orientation()',
        '(keydown)': 'onKeydown($event)',
    },
})
export class RtRadioGroupComponent implements IRtRadioGroupHost {
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Радиокнопки группы. Их список ведут сами радиокнопки, а не запрос по содержимому: запрос не
     * видит радиокнопку из шаблона обёртки потребителя, и такая радиокнопка осталась бы вне обхода.
     */
    readonly #members: WritableSignal<readonly IRtRadioGroupMember[]> = signal<readonly IRtRadioGroupMember[]>([]);

    /** Радиокнопки в порядке страницы: регистрация идёт в порядке создания, а не расположения. */
    protected readonly radios: Signal<readonly IRtRadioGroupMember[]> = computed((): readonly IRtRadioGroupMember[] => {
        const order: readonly Element[] = Array.from(this.#host.nativeElement.querySelectorAll('rt-radio-button'));
        return [...this.#members()].sort(
            (a: IRtRadioGroupMember, b: IRtRadioGroupMember): number => order.indexOf(a.element) - order.indexOf(b.element)
        );
    });

    /** Радиокнопка, стоящая в порядке обхода: выбранная, иначе первая включённая. */
    protected readonly tabStop: Signal<IRtRadioGroupMember | null> = computed((): IRtRadioGroupMember | null => {
        const radios: readonly IRtRadioGroupMember[] = this.radios();
        return (
            radios.find((radio: IRtRadioGroupMember): boolean => radio.selected() && !radio.off()) ??
            radios.find((radio: IRtRadioGroupMember): boolean => !radio.off()) ??
            null
        );
    });

    /** Имя группы для вспомогательных средств — вопрос, на который отвечают радиокнопки. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly orientation: InputSignal<TRtRadioGroupOrientation> = input<TRtRadioGroupOrientation>('vertical');

    constructor() {
        // Шаг Tab раздаётся после отрисовки: радиокнопки, выведенные `@for`, получают значение по
        // одной, и чтение выбора соседки до того, как ей поставили значение, роняет вид (NG0950).
        afterRenderEffect({
            write: (): void => {
                const stop: IRtRadioGroupMember | null = this.tabStop();
                for (const radio of this.radios()) {
                    radio.setTabStop(Object.is(radio, stop));
                }
            },
        });
    }

    public register(radio: IRtRadioGroupMember): void {
        this.#members.update((members: readonly IRtRadioGroupMember[]): readonly IRtRadioGroupMember[] => [...members, radio]);
    }

    public unregister(radio: IRtRadioGroupMember): void {
        this.#members.update((members: readonly IRtRadioGroupMember[]): readonly IRtRadioGroupMember[] =>
            members.filter((member: IRtRadioGroupMember): boolean => member !== radio)
        );
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (!NEXT_KEYS.has(event.key) && !PREV_KEYS.has(event.key)) {
            return;
        }
        const step: number = NEXT_KEYS.has(event.key) ? 1 : -1;
        const radios: readonly IRtRadioGroupMember[] = this.radios();
        const from: number = radios.findIndex((radio: IRtRadioGroupMember): boolean => radio.contains(event.target));
        if (from < 0) {
            return;
        }
        event.preventDefault();
        for (let shift: number = 1; shift < radios.length; shift += 1) {
            const next: IRtRadioGroupMember = radios[(from + step * shift + radios.length * shift) % radios.length];
            if (!next.off()) {
                next.selectFromKeyboard();
                return;
            }
        }
    }
}
