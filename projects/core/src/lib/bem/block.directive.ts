import { Attribute, Directive, ElementRef, InputSignal, Optional, Renderer2, effect, input } from '@angular/core';

import { IModsObject, TMods } from './bem.types';
import { generateClass, parseMods, setMods } from './bem.utils';

@Directive({
    selector: '[rtBlock]',
})
export class BlockDirective {
    #mods: IModsObject = {};

    public readonly rtMod: InputSignal<TMods | undefined> = input<TMods | undefined>(undefined);

    constructor(
        public readonly element: ElementRef,
        public readonly renderer: Renderer2,
        @Attribute('rtBlock') public readonly name: string,
        @Optional() @Attribute('rtElem') private readonly elem: string
    ) {
        if (!elem && !(element.nativeElement instanceof Comment)) {
            renderer.addClass(element.nativeElement, generateClass(name));
        }

        effect((): void => {
            const mods: IModsObject = parseMods(this.rtMod());

            this.#applyMods(mods);
        });
    }

    /**
     * Имя блока на том же узле, что и имя элемента, значит: узел рисует элемент, а не блок, —
     * модификаторы на нём ставит директива элемента. Узел-комментарий классов не носит вовсе.
     */
    #applyMods(mods: IModsObject): void {
        if (this.elem || this.element.nativeElement instanceof Comment) {
            return;
        }

        setMods(this.name, '', mods, this.#mods, this.element, this.renderer);

        this.#mods = this.#mods === mods ? Object.assign({}, mods) : mods;
    }
}
