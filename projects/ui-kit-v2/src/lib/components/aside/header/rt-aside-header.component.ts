import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    inject,
    input,
    output,
    signal,
    untracked,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    viewChild,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtSkeletonWrapperComponent, RtSkeletonWrapperContentDirective } from '@rt-tools/ui-kit-v2/skeleton-wrapper';
import { RtTagComponent } from '@rt-tools/ui-kit-v2/tag';
import { RtAsideRef } from '../rt-aside-ref';
import { RtAsideNodePlace } from '../rt-aside-node-place';
import { RT_ASIDE_SHEET, RtAsideSheet } from '../rt-aside-sheet';
import { RtAsideHeaderTitle } from './rt-aside-header-title';
import { IRtAsideHeader } from './rt-aside-header.model';

const BEM_BLOCK: string = 'rt-aside-header';

/** Селектор слота содержимого колонки заголовка. */
const HEADING_CONTENT_SLOT: string = '[asideHeadingContent]';

/**
 * Заголовок side-sheet'а; работает в двух modes:
 *
 * 1. **Programmatic** (через `RtAsideService.open()`) — `RtAsideRef` провайдится
 *    оверлей-инжектором; стрелка «назад» дёргает `asideRef.close()` напрямую,
 *    consumer подписан на `afterClosed()`.
 * 2. **Route-driven** (через `[rtContainerRightSidenavPanel]` driver в
 *    rt-container'е) — `RtAsideRef` НЕ провайдится (overlay принадлежит
 *    rt-container'у, не RtAsideService). Consumer слушает `(dismiss)` output и
 *    сам зовёт `panel.close()`.
 *
 * Оба пути живут одновременно: `onDismiss()` сперва эмитит output, затем (если
 * есть) дёргает optional `asideRef.close()`.
 *
 * Доменные действия (отклонить / удалить / снять с публикации и т.п.)
 * проецируются в слот `[asideActions]` как ряд `rt-icon-button` справа от title.
 *
 * Слот `[asideHeaderContent]` — строка под заголовком на всю ширину шапки: поиск, вкладки,
 * сводка. Пустой слот места не занимает.
 *
 * Слот `[asideHeadingContent]` — содержимое в колонке заголовка, под подписью и бэйджами, по её
 * левому краю. Пустой слот ничего не рисует.
 *
 * В шторке телефона шапка рисуется шапкой шторки: «×» слева вместо стрелки, заголовок в одну строку,
 * справа значки `[asideActions]` и за ними главная кнопка подвала, которую сюда переносит панель.
 * Заголовок стоит по центру шапки, если влазит; иначе — на всём месте между «×» и кнопками справа,
 * по центру этого места, с многоточием. «×» идёт дорогой стрелки: `dismiss`, затем `asideRef.close()`.
 *
 * `ViewEncapsulation.None` — для единообразия с rt-dialog-header (стили
 * префиксованы `.rt-aside-header`).
 *
 * @example
 * ```html
 * <rt-aside-header title="Профиль пользователя" />
 * <rt-aside-header title="Создание записи" [closable]="false" />
 * <rt-aside-header title="Детали" (dismiss)="onClose()">
 *     <rt-icon-button asideActions icon="ico-error" variant="danger"
 *                     ariaLabel="Отклонить" (clicked)="reject()" />
 * </rt-aside-header>
 * ```
 */
@Component({
    selector: 'rt-aside-header',
    templateUrl: './rt-aside-header.component.html',
    styleUrl: './rt-aside-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,
        // standalone components / directives
        RtIconButtonComponent,
        RtSkeletonWrapperComponent,
        RtSkeletonWrapperContentDirective,
        RtTagComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-aside-header--sheet]': 'sheetMode()',
    },
})
export class RtAsideHeaderComponent {
    readonly #asideRef: RtAsideRef | null = inject(RtAsideRef, { optional: true });
    readonly #sheet: RtAsideSheet | null = inject(RT_ASIDE_SHEET, { optional: true });
    readonly #titleFit: RtAsideHeaderTitle = new RtAsideHeaderTitle((between: boolean): void => this.titleBetween.set(between));
    /** Содержимое колонки заголовка: в шторке оно стоит под шапкой, вне шторки — в колонке. */
    readonly #headingContent: RtAsideNodePlace = new RtAsideNodePlace();

    /** Ряд шапки: по его частям решается место заголовка шторки. */
    protected readonly row: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('row');
    protected readonly heading: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('heading');
    /** Блок под шапкой шторки; вне шторки его нет. */
    protected readonly sheetMeta: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('sheetMeta');

    /**
     * Заголовок шторки не влазит по центру шапки: он стоит на всём месте между «×» и кнопками справа,
     * по центру этого места, и режется многоточием.
     */
    protected readonly titleBetween: WritableSignal<boolean> = signal<boolean>(false);

    /** Текст заголовка — рендерится в `<h2>`. Null/пустая строка вместе с
     *  `[loading]=true` показывают skeleton вместо title. */
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Шапка стоит в шторке телефона. */
    protected readonly sheetMode: Signal<boolean> = computed((): boolean => this.#sheet?.active() ?? false);

    /** Шторка панели — второй экран другой шторки: слева шеврон «назад» вместо «×». */
    protected readonly sheetBack: Signal<boolean> = computed((): boolean => this.#sheet?.nested() ?? false);

    public readonly title: InputSignal<string | null> = input<string | null>(null);

    /**
     * Мелкий приглушённый надзаголовок НАД основным title (контекст действия:
     * «Создание записи», «Запись № 6»). Null (дефолт) — обычный
     * однострочный хедер. Overline не участвует в skeleton-режиме — это
     * статичный текст, известный до загрузки данных.
     */
    public readonly overline: InputSignal<string | null> = input<string | null>(null);

    /**
     * Приглушённая подпись ПОД заголовком: что делается в панели. Null (дефолт) —
     * строки нет. Как надзаголовок, в skeleton-режиме не участвует.
     */
    public readonly subtitle: InputSignal<string | null> = input<string | null>(null);

    /**
     * Ряд бэйджей (`rt-tag`) под заголовком — контекст сущности (статус, метка
     * записи и т.п.). Пустой массив (дефолт) — ряд не рендерится. Async-данные:
     * потребитель отдаёт `[]` пока сущность не зарезолвилась.
     */
    public readonly badges: InputSignal<readonly IRtAsideHeader.Badge[]> = input<readonly IRtAsideHeader.Badge[]>([]);

    /**
     * Показывать стрелку закрытия в углу заголовка. Дефолт `true`. В шторке телефона «×» стоит всегда,
     * и этот вход его не прячет.
     */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Показывать skeleton вместо title (loading-state aside'а пока данные
     *  резолвятся через async fasade). Дефолт `false`. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Эмитится при клике по стрелке «назад» — намерение пользователя закрыть
     * aside (intent, не «закрыто»). Route-driven consumer слушает этот output и
     * дёргает `panel.close()` сам. Имя `dismiss` вместо `close` — ESLint
     * `@angular-eslint/no-output-native` блокирует output с именем стандартного
     * DOM-события (`close`).
     */
    public readonly dismiss: OutputEmitterRef<void> = output<void>();

    /** Место главной кнопки справа в шапке шторки; вне шторки его нет. */
    public readonly sheetMainSlot: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('sheetMain');

    constructor() {
        // Место заголовка шторки — по центру шапки, если влазит, иначе между кнопками. Решается
        // мерой после отрисовки и заново, когда меняется заголовок или ширина частей шапки.
        afterRenderEffect((): void => {
            const row: HTMLElement | null = this.sheetMode() ? this.row().nativeElement : null;
            this.title();
            this.loading();
            untracked((): void => this.#titleFit.attach(row));
        });
        // Содержимое колонки заголовка проецируется в колонку без условия; в шторке шапка ставит его
        // узлы в конец блока под собой, вне шторки они возвращаются в колонку.
        afterRenderEffect((): void => {
            const meta: HTMLElement | null = this.sheetMeta()?.nativeElement ?? null;
            const heading: HTMLElement = this.heading().nativeElement;
            untracked((): void => this.#placeHeadingContent(heading, meta));
        });
        const leave: (() => void) | undefined = this.#sheet?.addHeader();
        inject(DestroyRef).onDestroy((): void => {
            this.#titleFit.detach();
            leave?.();
        });
    }

    /** Узлы слота `[asideHeadingContent]` под шапкой шторки; шторки нет — в колонке заголовка. */
    #placeHeadingContent(heading: HTMLElement, meta: HTMLElement | null): void {
        if (meta === null) {
            this.#headingContent.restore();
            return;
        }
        const slot: string = `:scope > ${HEADING_CONTENT_SLOT}`;
        // Узлы, уже стоящие под шапкой, идут первыми: перенос их узнаёт и не трогает.
        const nodes: HTMLElement[] = [
            ...Array.from(meta.querySelectorAll<HTMLElement>(slot)),
            ...Array.from(heading.querySelectorAll<HTMLElement>(slot)),
        ];
        this.#headingContent.move(nodes, meta);
    }

    /**
     * «×» шторки идёт дорогой стрелки. У панели службы кита с признаком несохранённого служба
     * сначала спрашивает внизу экрана, и дорога идёт после ответа «Закрыть без сохранения».
     * Панель маршрута спрашивает сама, получив `dismiss`.
     */
    protected onSheetClose(): void {
        if (this.#sheet === null) {
            this.onDismiss();
            return;
        }
        if (this.#asideRef === null) {
            // Панель маршрута: шапка без стрелки могла не слушать `dismiss`, и «×» закрывает её как
            // свайп — просьбой к рамке.
            if (this.closable()) {
                this.onDismiss();
            } else {
                this.#sheet.requestClose('dismiss');
            }
            return;
        }
        this.#sheet.requestClose('dismiss', (): void => this.onDismiss());
    }

    protected onDismiss(): void {
        // Сначала output — route-driven consumer обработает intent.
        this.dismiss.emit();
        // Затем (если есть) AsideRef — programmatic mode через RtAsideService.
        this.#asideRef?.close();
    }
}
