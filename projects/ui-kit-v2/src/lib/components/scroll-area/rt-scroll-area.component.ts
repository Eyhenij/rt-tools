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

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
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
     * Наблюдатель за размером тела, его содержимого и подвала. Событие прокрутки приходит только
     * после движения руки, а список не влезает уже в первую минуту показа: без наблюдателя признак
     * появлялся бы у того, кто и так догадался прокрутить, и молчал у того, кому он нужен.
     */
    #sizeWatch: TNullable<ResizeObserver> = null;

    /**
     * Наблюдатель за составом тела. Тело — окно постоянной высоты, и когда список дорастает под ним,
     * размер тела не меняется: наблюдатель размера молчит. Пришедшие узлы ставятся под наблюдение
     * размера здесь же — их высота меняется и после того, как они легли.
     */
    #contentWatch: TNullable<MutationObserver> = null;

    /** Узлы, за которыми наблюдают сейчас: пересозданное тело или подвал ставятся под наблюдение заново. */
    #watchedBody: HTMLElement | null = null;
    #watchedFooter: HTMLElement | null = null;

    /** Наблюдение поставлено: тело и подвал могут быть и пустыми, флаг отличает «снято» от «нечего смотреть». */
    #isWatching: boolean = false;

    constructor() {
        // Наблюдатели живут, только пока признак включён: выключенный признак ничего не рисует, а
        // наблюдатель состава с поддеревом заставлял бы браузер пересчитывать раскладку на каждую
        // правку внутри тела у каждой области экрана. Включение ставит их, выключение снимает.
        afterRenderEffect((): void => {
            const body: HTMLElement | null = this.bodyRef()?.nativeElement ?? null;
            const footer: HTMLElement | null = this.footerRef()?.nativeElement ?? null;

            if (!this.isScrollHintShown()) {
                this.#unwatch();
                this.hasMoreBelow.set(false);

                return;
            }

            this.onBodyScroll();

            if (!this.#isWatching || body !== this.#watchedBody || footer !== this.#watchedFooter) {
                this.#watch(body, footer);
            }
        });

        this.#destroyRef.onDestroy((): void => this.#unwatch());
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
        // Выключенный признак не рисуется, и замер для него — чтение раскладки на каждое движение.
        if (!this.isScrollHintShown()) {
            return;
        }

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

    /** Ставит под наблюдение нынешние тело и подвал; прежние наблюдатели снимаются. */
    #watch(body: HTMLElement | null, footer: HTMLElement | null): void {
        this.#unwatch();
        this.#watchedBody = body;
        this.#watchedFooter = footer;
        this.#isWatching = true;

        if (!body) {
            return;
        }

        if (typeof ResizeObserver !== 'undefined') {
            this.#sizeWatch = new ResizeObserver((): void => this.onBodyScroll());
            this.#observeSizes();
        }

        if (typeof MutationObserver !== 'undefined') {
            this.#contentWatch = new MutationObserver((): void => {
                this.#observeSizes();
                this.onBodyScroll();
            });
            this.#contentWatch.observe(body, { childList: true, subtree: true, characterData: true });
        }
    }

    /**
     * Размер наблюдается у тела, у каждого его прямого потомка и у подвала. Подвал — наравне с
     * телом: от его высоты считается подъём полосы, и не наблюдавшаяся, она осталась бы стоять по
     * прежней высоте подвала и наехала бы на его первую строку.
     */
    #observeSizes(): void {
        const watch: TNullable<ResizeObserver> = this.#sizeWatch;
        const body: HTMLElement | null = this.#watchedBody;

        if (!watch || !body) {
            return;
        }

        // Состав тела сменился — ушедшие узлы снимаются вместе со всеми, пришедшие ставятся заново.
        watch.disconnect();
        watch.observe(body);
        Array.from(body.children).forEach((child: Element): void => watch.observe(child));

        if (this.#watchedFooter) {
            watch.observe(this.#watchedFooter);
        }
    }

    #unwatch(): void {
        this.#sizeWatch?.disconnect();
        this.#sizeWatch = null;
        this.#contentWatch?.disconnect();
        this.#contentWatch = null;
        this.#watchedBody = null;
        this.#watchedFooter = null;
        this.#isWatching = false;
    }
}
