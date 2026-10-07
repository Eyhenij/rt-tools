import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    HostBinding,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    Renderer2,
    Signal,
    untracked,
} from '@angular/core';

import { IRtKitConfig } from '@rt-tools/ui-kit-v2/core';
import { rtKitDefault } from '@rt-tools/ui-kit-v2/core';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RT_RADIUS_DEFAULT, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import {
    RT_ICON_GLYPH_STRATEGY,
    RT_ICON_MATERIAL_PRESET_SELECTOR,
    RtIconFontService,
    RtIconRegistry,
    resolveIconGlyph,
} from '@rt-tools/ui-kit-v2/icon';
import { iconMaterialDrawn } from '@rt-tools/ui-kit-v2/icon';
import { RtRippleDirective } from '@rt-tools/ui-kit-v2/ripple';
import { IButton } from '@rt-tools/ui-kit-v2/core';

const BEM_BLOCK: string = 'rt-button';

/** Длительность затухания спиннера при выходе из загрузки. */
const LOADING_FADE_OUT_MS: number = 300;

/** Запас поверх затухания, после которого подпись возвращается без анимации. */
const LOADING_FADE_OUT_BUFFER_MS: number = 50;

/**
 * Директива стилизованной кнопки. Применяется к `<button>` или `<a>`
 * (для ссылок-кнопок с `routerLink`/`href`).
 *
 * Иконка и лейбл рендерятся внутрь элемента через `Renderer2`, чтобы можно
 * было применять директиву к существующему элементу без обёртки.
 * Поддерживает анимированный переход в/из loading.
 *
 * @example
 * ```html
 * <button rtButton label="Войти" theme="primary"></button>
 * <button rtButton label="Скачать" icon="ico-download" theme="success"></button>
 * <button rtButton icon="pencil" theme="info" appearance="text"></button>
 * <button rtButton label="Сохранение..." [loading]="saving()" [disabled]="saving()"></button>
 * <a rtButton label="Главная" [routerLink]="'/'"></a>
 * ```
 */
@Directive({
    selector: 'button[rtButton], a[rtButton]',
    hostDirectives: [
        { directive: RtRippleDirective, inputs: ['rippleDisabled'] },
        { directive: RtRadiusDirective, inputs: ['radius'] },
    ],
    /* Шаг скругления без входа берётся из настроек кита: приложение, скруглившее все кнопки разом,
       называет шаг один раз, а вход на кнопке по-прежнему сильнее. */
    providers: [
        {
            provide: RT_RADIUS_DEFAULT,
            useFactory: (): TRtRadius | null =>
                rtKitDefault('button', (it: IRtKitConfig.Button): TRtRadius | null | undefined => it.radius, null),
        },
    ],
})
export class RtButtonDirective {
    readonly #el: ElementRef<HTMLButtonElement | HTMLAnchorElement> = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);
    readonly #renderer: Renderer2 = inject(Renderer2);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #iconRegistry: RtIconRegistry = inject(RtIconRegistry);
    readonly #glyphStrategy: IRtIcon.GlyphStrategy = inject(RT_ICON_GLYPH_STRATEGY);
    readonly #fontReady: Signal<boolean> = inject(RtIconFontService).ready;

    /* С чего стартуют три входа, которые приложение вправе задать киту разом. Значение считается
       из настроек при объявлении входа: так публичный вид входа не меняется — ни тип, ни имя, — а
       вход, написанный в разметке, по-прежнему перебивает всё. Цена — настройки читаются один раз,
       когда узел создан. */
    readonly #appearance: IButton.Appearance = rtKitDefault(
        'button',
        (it: IRtKitConfig.Button): IButton.Appearance | undefined => it.appearance,
        'filled'
    );
    readonly #size: IButton.Size = rtKitDefault('button', (it: IRtKitConfig.Button): IButton.Size | undefined => it.size, 'md');

    #iconEl: HTMLElement | null = null;
    #labelEl: HTMLElement | null = null;
    #spinnerEl: HTMLElement | null = null;
    #wasLoading: boolean = false;

    protected readonly isIconOnly: Signal<boolean> = computed(() => !!this.icon() && !this.label());

    /** Текстовый лейбл кнопки. Если null — кнопка только с иконкой. */
    public readonly label: InputSignal<string | null> = input<string | null>(null);
    /**
     * Значок кнопки: имя кита (`check`) или имя Material (`arrow_back`). Имя Material рисуется
     * так же, как вход `glyph` у `rt-icon`: парой из перечня кита или лигатурой шрифта — по
     * настройке `glyphStrategy` у `provideRtIcons()`. Если null — без иконки.
     */
    public readonly icon: InputSignal<string | null> = input<string | null>(null);
    /** Сторона размещения иконки относительно лейбла. */
    public readonly iconPos: InputSignal<IButton.IconPos> = input<IButton.IconPos>('left');
    /** Семантическая палитра. */
    public readonly theme: InputSignal<IButton.Theme> = input<IButton.Theme>('primary');
    /** Внешний вид (filled / outlined / text). Умолчание — из настроек кита. */
    public readonly appearance: InputSignal<IButton.Appearance> = input<IButton.Appearance>(this.#appearance);
    /** Размер. Умолчание — из настроек кита. */
    public readonly size: InputSignal<IButton.Size> = input<IButton.Size>(this.#size);
    /** Состояние загрузки: показывает спиннер вместо иконки, блокирует клики. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Кастомный CSS-класс иконки в loading. Если null — встроенный CSS-спиннер. */
    public readonly loadingIcon: InputSignal<string | null> = input<string | null>(null);
    /**
     * Подпись во время загрузки. `hide` оставляет подпись и иконку в кнопке невидимыми — ширина
     * не скачет, — а спиннер ставит по центру; имя кнопки для скринридера остаётся.
     */
    public readonly loadingLabel: InputSignal<IButton.LoadingLabel> = input<IButton.LoadingLabel>('keep');

    /**
     * Положение двухпозиционной кнопки: `true` — нажата, `false` — отжата, `null` — положения нет
     * вовсе.
     *
     * Три значения, а не два, потому что обычная кнопка переключателем не является и объявлять
     * себя двухпозиционной не должна: сказанное вспомогательным средствам «эта кнопка отжата» на
     * кнопке, которая просто запускает действие, — ложь, а не умолчание. Отжатое положение при
     * этом объявляется наравне с нажатым: молчащая в отжатом виде кнопка неотличима от обычной, и
     * о втором положении узнают только нажав.
     *
     * Само по нажатию положение не меняется: кнопка говорит о нажатии наружу, а положение
     * возвращает вызывающий — иначе вид кнопки и состояние приложения расходятся при первом же
     * отказе сохранения.
     */
    public readonly pressed: InputSignal<boolean | null> = input<boolean | null>(null);

    constructor() {
        afterNextRender(() => untracked(() => this.#updateContent()));

        effect(() => {
            this.label();
            this.icon();
            this.iconPos();
            this.loading();
            this.loadingIcon();
            this.loadingLabel();
            // Лигатура до готовности шрифтов скрыта: готовность перерисовывает содержимое.
            this.#fontReady();

            untracked(() => this.#updateContent());
        });
    }

    /** Положение наружу: атрибута нет вовсе там, где положения у кнопки не бывает. */
    @HostBinding('attr.aria-pressed')
    protected get ariaPressed(): string | null {
        const pressed: boolean | null = this.pressed();

        return pressed === null ? null : String(pressed);
    }

    @HostBinding('class')
    protected get hostClasses(): Record<string, boolean> {
        const theme: IButton.Theme = this.theme();
        const appearance: IButton.Appearance = this.appearance();
        const size: IButton.Size = this.size();

        return {
            [BEM_BLOCK]: true,
            [`${BEM_BLOCK}--${theme}`]: theme !== 'primary',
            [`${BEM_BLOCK}--outlined`]: appearance === 'outlined',
            [`${BEM_BLOCK}--text`]: appearance === 'text',
            [`${BEM_BLOCK}--loading`]: this.loading(),
            [`${BEM_BLOCK}--loading-label-hidden`]: this.loading() && this.loadingLabel() === 'hide',
            [`${BEM_BLOCK}--icon-only`]: this.isIconOnly(),
            [`${BEM_BLOCK}--${size}`]: size !== 'md',
            [`${BEM_BLOCK}--pressed`]: this.pressed() === true,
        };
    }

    #updateContent(): void {
        const button: HTMLButtonElement | HTMLAnchorElement = this.#el.nativeElement;
        const isLoading: boolean = this.loading();
        const wasLoading: boolean = this.#wasLoading;
        this.#wasLoading = isLoading;

        if (wasLoading && !isLoading) {
            this.#transitionFromLoading(button);
            return;
        }

        this.#clearContent(button);

        if (isLoading) {
            this.#renderLoading(button);
            return;
        }

        this.#renderIconAndLabel(button);
    }

    #transitionFromLoading(button: HTMLElement): void {
        const spinnerEl: HTMLElement | null = this.#spinnerEl;

        if (spinnerEl === null) {
            this.#restoreContent(button);
            return;
        }

        spinnerEl.style.animation = `rt-button-fade-out ${LOADING_FADE_OUT_MS}ms ease-out forwards`;

        // settled-гард делает animationend и страховочный таймаут взаимно
        // идемпотентными — сработает и снимет listener только то, что раньше.
        // Без таймаута подпись возвращалась бы только по анимации, а она не
        // идёт, пока кнопка спрятана (свёрнутая панель, неактивная вкладка):
        // выход из загрузки не наступал никогда, и на кнопке навсегда
        // оставался голый спиннер.
        let settled: boolean = false;

        const finish: () => void = (): void => {
            if (settled) {
                return;
            }
            settled = true;
            spinnerEl.removeEventListener('animationend', finish);
            this.#restoreContent(button);
        };

        spinnerEl.addEventListener('animationend', finish);
        setTimeout(finish, LOADING_FADE_OUT_MS + LOADING_FADE_OUT_BUFFER_MS);
    }

    #restoreContent(button: HTMLElement): void {
        this.#clearContent(button);
        this.#renderIconAndLabel(button);
    }

    /**
     * Чистим по классу, а не по своим ссылкам. Под серверным рендером разметку
     * кнопки рисует сервер: после гидратации лейбл и иконка уже лежат в DOM, но создавал их
     * другой экземпляр директивы, и `#labelEl` у клиентского — пустой. Ссылки
     * тогда не находят ничего, а `#renderIconAndLabel` дорисовывает второй
     * лейбл — подпись кнопки удваивается («СохранитьСохранить»).
     */
    #clearContent(button: HTMLElement): void {
        const ownClasses: ReadonlyArray<string> = [`${BEM_BLOCK}__icon`, `${BEM_BLOCK}__label`, `${BEM_BLOCK}__spinner`];

        // Обход по детям, а не селектором `:scope >`: тот же код исполняется на
        // сервере, где DOM эмулированный и селекторный движок урезан
        for (const child of Array.from(button.children)) {
            if (ownClasses.some((ownClass: string): boolean => child.classList.contains(ownClass))) {
                this.#renderer.removeChild(button, child);
            }
        }

        this.#iconEl = null;
        this.#labelEl = null;
        this.#spinnerEl = null;
    }

    #renderLoading(button: HTMLElement): void {
        const loadingIcon: string | null = this.loadingIcon();
        const loader: HTMLElement = loadingIcon ? this.#createIcon(loadingIcon) : this.#createSpinner();

        if (this.loadingLabel() === 'hide') {
            // Обычное содержимое остаётся и держит ширину; стили гасят его и ставят
            // загрузчик поверх по центру
            this.#renderIconAndLabel(button);
            this.#renderer.addClass(loader, `${BEM_BLOCK}__loader`);
            this.#renderer.appendChild(button, loader);
            if (!loadingIcon) {
                this.#spinnerEl = loader;
            }
            return;
        }

        if (loadingIcon) {
            this.#iconEl = loader;
            this.#renderer.appendChild(button, this.#iconEl);
        } else {
            this.#spinnerEl = loader;
            this.#renderer.appendChild(button, this.#spinnerEl);
        }

        const label: string | null = this.label();
        if (label) {
            this.#labelEl = this.#createLabel(label);
            this.#renderer.appendChild(button, this.#labelEl);
        }
    }

    #renderIconAndLabel(button: HTMLElement): void {
        const iconClass: string | null = this.icon();
        const label: string | null = this.label();
        const pos: IButton.IconPos = this.iconPos();

        const iconEl: HTMLElement | null = iconClass ? this.#createIcon(iconClass) : null;
        const labelEl: HTMLElement | null = label ? this.#createLabel(label) : null;

        if (pos === 'left') {
            if (iconEl) {
                this.#renderer.appendChild(button, iconEl);
            }
            if (labelEl) {
                this.#renderer.appendChild(button, labelEl);
            }
        } else {
            if (labelEl) {
                this.#renderer.appendChild(button, labelEl);
            }
            if (iconEl) {
                this.#renderer.appendChild(button, iconEl);
            }
        }

        this.#iconEl = iconEl;
        this.#labelEl = labelEl;
    }

    #createIcon(iconName: string): HTMLElement {
        const resolved: IRtIcon.Resolved | null = resolveIconGlyph(null, iconName, this.#glyphStrategy);
        if (resolved?.kind === 'kit') {
            return this.#createKitIcon(resolved.name);
        }
        return this.#createGlyph(iconName);
    }

    #createKitIcon(name: IRtIcon.Name): HTMLElement {
        const svg: SVGSVGElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.classList.add(`${BEM_BLOCK}__icon`);

        // Тот же путь, что и у компонента значка: имя просится у реестра, а он ходит за файлом
        // один раз на страницу — значок, спрошенный обеими разметками сразу, едет одним запросом.
        const drawing: IRtIcon.Drawing = this.#drawingOf(name);
        this.#iconRegistry.request(name, drawing);

        const use: SVGUseElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', this.#iconRegistry.symbolHref(name, drawing));
        svg.appendChild(use);

        return svg as unknown as HTMLElement;
    }

    /**
     * Набор рисунка — как у компонента значка: материальный рисунок под разметкой с признаком
     * материального набора, если у имени он есть. Признак читается при каждой отрисовке
     * содержимого, а после первой отрисовки она повторяется — контейнер к тому времени на месте.
     */
    #drawingOf(name: IRtIcon.Name): IRtIcon.Drawing {
        const underMaterial: boolean = this.#el.nativeElement.closest(RT_ICON_MATERIAL_PRESET_SELECTOR) !== null;
        return underMaterial && iconMaterialDrawn.has(name) ? 'material' : 'base';
    }

    /** Лигатура шрифта Material Symbols для имени без пары. Шрифт подключает приложение. */
    #createGlyph(glyph: string): HTMLElement {
        const el: HTMLElement = this.#renderer.createElement('span') as HTMLElement;
        this.#renderer.addClass(el, `${BEM_BLOCK}__icon`);
        this.#renderer.addClass(el, `${BEM_BLOCK}__glyph`);
        if (!this.#fontReady()) {
            this.#renderer.addClass(el, `${BEM_BLOCK}__glyph--pending`);
        }
        this.#renderer.setAttribute(el, 'aria-hidden', 'true');
        this.#renderer.appendChild(el, this.#renderer.createText(glyph));
        return el;
    }

    #createLabel(text: string): HTMLElement {
        const el: HTMLElement = this.#renderer.createElement('span') as HTMLElement;
        this.#renderer.addClass(el, `${BEM_BLOCK}__label`);
        this.#renderer.appendChild(el, this.#renderer.createText(text));
        return el;
    }

    #createSpinner(): HTMLElement {
        const wrapper: HTMLElement = this.#renderer.createElement('span') as HTMLElement;
        this.#renderer.addClass(wrapper, `${BEM_BLOCK}__spinner`);

        const circle: HTMLElement = this.#renderer.createElement('span') as HTMLElement;
        this.#renderer.addClass(circle, `${BEM_BLOCK}__spinner-circle`);
        this.#renderer.appendChild(wrapper, circle);

        return wrapper;
    }
}
