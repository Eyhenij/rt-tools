import { FocusKeyManager } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, DestroyRef, Directive, ElementRef } from '@angular/core';

/** Пункт меню для перехода стрелками: отключённый пропускается. */
interface IRtTabsMenuItem {
    readonly disabled: boolean;
    focus(): void;
}

/**
 * Клавиатура в меню «Ещё» и в меню вкладки по правой кнопке, на том же `FocusKeyManager`, что и
 * `rt-menu`: открытое меню берёт фокус на первый пункт, стрелки, Home и End ходят по пунктам, а
 * закрытое возвращает фокус туда, откуда его открыли. Пункты — узлы с ролью `menuitem`; в меню,
 * которое приложение объявило без ролей, — его кнопки.
 */
@Directive({
    selector: '[rtTabsMenuKeys]',
    host: { '(keydown)': 'onKeydown($event)' },
})
export class RtTabsMenuKeysDirective {
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly #doc: Document = inject(DOCUMENT);

    /** Узел с фокусом в минуту открытия: кнопка «Ещё» или вкладка. */
    readonly #returnTo: Element | null = this.#doc.activeElement;

    #keys: FocusKeyManager<IRtTabsMenuItem> | null = null;

    constructor() {
        afterNextRender((): void => {
            const items: IRtTabsMenuItem[] = this.#items().map((node: HTMLElement): IRtTabsMenuItem => ({
                disabled: node.getAttribute('aria-disabled') === 'true' || node.hasAttribute('disabled'),
                focus: (): void => node.focus(),
            }));
            this.#keys = new FocusKeyManager<IRtTabsMenuItem>(items).withWrap().withHomeAndEnd();
            this.#keys.setFirstItemActive();
        });

        inject(DestroyRef).onDestroy((): void => {
            this.#keys?.destroy();
            const active: Element | null = this.#doc.activeElement;
            const lost: boolean = active === null || active === this.#doc.body || this.#host.contains(active);
            if (lost && this.#returnTo instanceof HTMLElement && this.#returnTo.isConnected) {
                this.#returnTo.focus();
            }
        });
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Tab' && event.key !== 'Escape') {
            this.#keys?.onKeydown(event);
        }
    }

    #items(): HTMLElement[] {
        const items: HTMLElement[] = Array.from(this.#host.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        return items.length > 0 ? items : Array.from(this.#host.querySelectorAll<HTMLElement>('button'));
    }
}
