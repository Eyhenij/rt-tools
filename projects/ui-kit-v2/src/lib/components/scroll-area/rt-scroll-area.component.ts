import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignalWithTransform,
    signal,
    Signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';

import { RT_KIT_LABELS, TRtKitLabelMap } from '../../i18n';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtScrollAreaContentDirective, RtScrollAreaFooterDirective, RtScrollAreaHeaderDirective } from './rt-scroll-area.directives';

const BEM_BLOCK: string = 'rt-scroll-area';

/**
 * Целый пункт запаса при сравнении прокрутки с высотой.
 *
 * Дробная высота строки оставляет остаток, при котором прокрутка уже в самом низу, а разность
 * всё ещё больше нуля: без запаса признак непоказанного висел бы навсегда.
 */
const BOTTOM_SLACK_PX: number = 1;

/**
 * Область прокрутки: шапка и подвал стоят, тело прокручивается.
 *
 * Части объявляет потребитель — по директиве на каждую. Необъявленная часть не рисуется вовсе:
 * пустая шапка это полоса отступа над списком, а высоту она забирает у тела, ради которого
 * область и открыли.
 *
 * Договорённость — `docs/specs/ui-kit-v2/scroll-area/`.
 */
@Component({
    selector: 'rt-scroll-area',
    templateUrl: './rt-scroll-area.component.html',
    styleUrls: ['./rt-scroll-area.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtIconComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtScrollAreaComponent {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly bodyRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('body');
    protected readonly footerRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('foot');

    /**
     * Ниже окна области ещё есть содержимое. Считается по трём числам самого узла, а не по числу
     * пунктов: область не знает, что ей подали, и высота строки у каждого потребителя своя.
     */
    protected readonly hasMoreBelow: WritableSignal<boolean> = signal(false);

    /**
     * На сколько полоса растушёвки поднята над низом области. Она обязана кончиться там, где
     * начинается содержимое подвала: разделитель потребитель рисует первой его строкой, и полоса,
     * оборвавшаяся выше, оставляет до него чистый фон. Считается замером — верхний отступ подвала
     * потребитель пишет как хочет, и вычесть его в стилях не из чего. Без подвала полоса стоит у
     * самого низа.
     */
    protected readonly hintBottom: WritableSignal<number> = signal(0);

    public readonly headerTpl: Signal<TNullable<RtScrollAreaHeaderDirective>> = contentChild(RtScrollAreaHeaderDirective);
    public readonly contentTpl: Signal<TNullable<RtScrollAreaContentDirective>> = contentChild(RtScrollAreaContentDirective);
    public readonly footerTpl: Signal<TNullable<RtScrollAreaFooterDirective>> = contentChild(RtScrollAreaFooterDirective);

    /**
     * Признак того, что снизу осталось непоказанное. Выключен по умолчанию: область рисуют
     * десятки экранов, и признак, поставленный безусловно, сдвинул бы вид каждому из них.
     */
    public readonly isScrollHintShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /**
     * Наблюдатель за размером тела и подвала. Событие прокрутки приходит только после движения
     * руки, а список не влезает уже в первую минуту показа: без наблюдателя признак появлялся бы
     * у того, кто и так догадался прокрутить, и молчал у того, кому он нужен.
     */
    #sizeWatch: TNullable<ResizeObserver> = null;

    constructor() {
        afterRenderEffect((): void => {
            const body: TNullable<ElementRef<HTMLElement>> = this.bodyRef();

            this.onBodyScroll();

            if (!body || this.#sizeWatch || typeof ResizeObserver === 'undefined') {
                return;
            }

            this.#sizeWatch = new ResizeObserver((): void => this.onBodyScroll());
            this.#sizeWatch.observe(body.nativeElement);

            const footer: TNullable<ElementRef<HTMLElement>> = this.footerRef();

            // Подвал наблюдается наравне с телом: его высота меняется своим содержимым, а от неё
            // считается подъём полосы. Не наблюдавшаяся, она осталась бы стоять по прежней высоте
            // подвала и наехала бы на его первую строку.
            if (footer) {
                this.#sizeWatch.observe(footer.nativeElement);
            }
        });

        this.#destroyRef.onDestroy((): void => {
            this.#sizeWatch?.disconnect();
            this.#sizeWatch = null;
        });
    }

    /**
     * Нажатие на значок уводит тело к самому низу. Нажатие останавливается здесь и в содержимое
     * под значком не уходит: под ним живой пункт, и человек, целившийся в подсказку, уехал бы на
     * чужой экран.
     */
    public onScrollHintClick(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        const body: TNullable<ElementRef<HTMLElement>> = this.bodyRef();

        if (!body) {
            return;
        }

        body.nativeElement.scrollTo({ top: body.nativeElement.scrollHeight, behavior: 'smooth' });
    }

    public onBodyScroll(): void {
        this.#measureHintBottom();

        const body: TNullable<ElementRef<HTMLElement>> = this.bodyRef();

        if (!body) {
            this.hasMoreBelow.set(false);

            return;
        }

        const node: HTMLElement = body.nativeElement;

        this.hasMoreBelow.set(node.scrollHeight - node.scrollTop - node.clientHeight > BOTTOM_SLACK_PX);
    }

    /**
     * Подъём полосы над низом области: высота подвала без его верхнего отступа. Ровно на этом
     * месте начинается содержимое подвала, и до него полоса и должна доходить.
     */
    #measureHintBottom(): void {
        const footer: TNullable<ElementRef<HTMLElement>> = this.footerRef();

        if (!footer) {
            this.hintBottom.set(0);

            return;
        }

        const node: HTMLElement = footer.nativeElement;
        const paddingTop: number = parseFloat(getComputedStyle(node).paddingTop) || 0;

        this.hintBottom.set(Math.max(node.offsetHeight - paddingTop, 0));
    }
}
