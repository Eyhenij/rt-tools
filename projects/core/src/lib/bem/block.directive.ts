import { Directive, ElementRef, HostAttributeToken, InputSignal, Renderer2, effect, inject, input } from '@angular/core';

import { TModsObject, TMods } from './bem.types';
import { generateClass, parseMods, setMods } from './bem.utils';

@Directive({
    selector: '[rtBlock]',
})
export class BlockDirective {
    /** Имя элемента на том же узле; атрибута может не быть — как прежде с `@Optional() @Attribute`. */
    readonly #elem: string = inject(new HostAttributeToken('rtElem'), { optional: true }) as string;
    #mods: TModsObject = {};

    public readonly element: ElementRef = inject(ElementRef);
    public readonly renderer: Renderer2 = inject(Renderer2);
    /** Имя блока из атрибута; без статического атрибута — `null`, как прежде с `@Attribute`. */
    public readonly name: string = inject(new HostAttributeToken('rtBlock'), { optional: true }) as string;
    public readonly rtMod: InputSignal<TMods | undefined> = input<TMods | undefined>(undefined);

    constructor() {
        if (!this.#elem && !(this.element.nativeElement instanceof Comment)) {
            this.renderer.addClass(this.element.nativeElement, generateClass(this.name));
        }

        effect((): void => {
            const mods: TModsObject = parseMods(this.rtMod());

            this.#applyMods(mods);
        });
    }

    /**
     * Имя блока на том же узле, что и имя элемента, значит: узел рисует элемент, а не блок, —
     * модификаторы на нём ставит директива элемента. Узел-комментарий классов не носит вовсе.
     */
    #applyMods(mods: TModsObject): void {
        if (this.#elem || this.element.nativeElement instanceof Comment) {
            return;
        }

        setMods(this.name, '', mods, this.#mods, this.element, this.renderer);

        this.#mods = this.#mods === mods ? Object.assign({}, mods) : mods;
    }
}
