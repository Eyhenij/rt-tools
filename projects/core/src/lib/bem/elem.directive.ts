import { Attribute, Directive, ElementRef, InputSignal, Renderer2, effect, input } from '@angular/core';

import { TModsObject, TMods } from './bem.types';
import { generateClass, parseMods, setMods } from './bem.utils';
import { BlockDirective } from './block.directive';

@Directive({
    selector: '[rtElem]',
})
export class ElemDirective {
    #mods: TModsObject = {};

    public readonly rtMod: InputSignal<TMods | undefined> = input<TMods | undefined>(undefined);
    public blockName: string;

    constructor(
        public readonly element: ElementRef,
        public readonly renderer: Renderer2,
        @Attribute('rtElem') public readonly name: string,
        private readonly rtBlock: BlockDirective
    ) {
        this.blockName = rtBlock.name;

        renderer.addClass(element.nativeElement, generateClass(rtBlock.name, name));

        effect((): void => {
            const mods: TModsObject = parseMods(this.rtMod());

            setMods(this.blockName, this.name, mods, this.#mods, this.element, this.renderer);

            this.#mods = this.#mods === mods ? Object.assign({}, mods) : mods;
        });
    }
}
