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

import { RtIconRegistry, IRtIcon } from '../icon';
import { IButton } from './rt-button.model';

const BEM_BLOCK: string = 'rt-button';

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
 * <button rtButton icon="ico-pencil" theme="info" appearance="text"></button>
 * <button rtButton label="Сохранение..." [loading]="saving()" [disabled]="saving()"></button>
 * <a rtButton label="Главная" [routerLink]="'/'"></a>
 * ```
 */
@Directive({
    selector: 'button[rtButton], a[rtButton]',
})
export class RtButtonDirective {
    readonly #el: ElementRef<HTMLButtonElement | HTMLAnchorElement> = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);
    readonly #renderer: Renderer2 = inject(Renderer2);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #iconRegistry: RtIconRegistry = inject(RtIconRegistry);

    #iconEl: HTMLElement | null = null;
    #labelEl: HTMLElement | null = null;
    #spinnerEl: HTMLElement | null = null;
    #wasLoading: boolean = false;

    protected readonly isIconOnly: Signal<boolean> = computed(() => !!this.icon() && !this.label());

    /** Текстовый лейбл кнопки. Если null — кнопка только с иконкой. */
    public readonly label: InputSignal<string | null> = input<string | null>(null);
    /** CSS-класс иконки (например, `check`). Если null — без иконки. */
    public readonly icon: InputSignal<string | null> = input<string | null>(null);
    /** Сторона размещения иконки относительно лейбла. */
    public readonly iconPos: InputSignal<IButton.IconPos> = input<IButton.IconPos>('left');
    /** Семантическая палитра. */
    public readonly theme: InputSignal<IButton.Theme> = input<IButton.Theme>('primary');
    /** Внешний вид (filled / outlined / text). */
    public readonly appearance: InputSignal<IButton.Appearance> = input<IButton.Appearance>('filled');
    /** Размер. */
    public readonly size: InputSignal<IButton.Size> = input<IButton.Size>('md');
    /** Скруглённые углы (по умолчанию false — квадратная кнопка с radius из --rt-btn-radius). */
    public readonly rounded: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Состояние загрузки: показывает спиннер вместо иконки, блокирует клики. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Кастомный CSS-класс иконки в loading. Если null — встроенный CSS-спиннер. */
    public readonly loadingIcon: InputSignal<string | null> = input<string | null>(null);

    constructor() {
        afterNextRender(() => untracked(() => this.#updateContent()));

        effect(() => {
            this.label();
            this.icon();
            this.iconPos();
            this.loading();
            this.loadingIcon();

            untracked(() => this.#updateContent());
        });
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
            [`${BEM_BLOCK}--rounded`]: this.rounded(),
            [`${BEM_BLOCK}--loading`]: this.loading(),
            [`${BEM_BLOCK}--icon-only`]: this.isIconOnly(),
            [`${BEM_BLOCK}--${size}`]: size !== 'md',
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

        if (spinnerEl) {
            spinnerEl.style.animation = 'rt-button-fade-out 0.3s ease-out forwards';
            spinnerEl.addEventListener(
                'animationend',
                () => {
                    this.#clearContent(button);
                    this.#renderIconAndLabel(button);
                },
                { once: true }
            );
        } else {
            this.#clearContent(button);
            this.#renderIconAndLabel(button);
        }
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

        if (loadingIcon) {
            this.#iconEl = this.#createIcon(loadingIcon);
            this.#renderer.appendChild(button, this.#iconEl);
        } else {
            this.#spinnerEl = this.#createSpinner();
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
        // Рендерим SVG-sprite через RtIconRegistry — единый источник иконок
        // (как rt-icon / rt-icon-button / rt-input). Старый `<i class="ico-X">`
        // паттерн требовал icon-font CSS, который ушёл вместе с PrimeNG.
        const svg: SVGSVGElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.classList.add(`${BEM_BLOCK}__icon`);

        const use: SVGUseElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'use');
        // Регистр типизирован через IRtIcon.Name; директива принимает arbitrary
        // string для совместимости со старыми потребителями. Если name неизвестен,
        // <use href> просто не зарезолвится — браузер тихо отрендерит пустой контейнер.
        use.setAttribute('href', this.#iconRegistry.symbolHref(iconName as IRtIcon.Name));
        svg.appendChild(use);

        return svg as unknown as HTMLElement;
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
