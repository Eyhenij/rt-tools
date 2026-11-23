import { Directive, ElementRef, HostAttributeToken, InputSignal, Renderer2, effect, inject, input } from '@angular/core';

import { TModsObject, TMods } from './bem.types';
import { generateClass, parseMods, setMods } from './bem.utils';
import { BlockDirective } from './block.directive';

@Directive({
    selector: '[rtElem]',
})
export class ElemDirective {
    readonly #rtBlock: BlockDirective = inject(BlockDirective);
    #mods: TModsObject = {};

    public readonly element: ElementRef = inject(ElementRef);
    public readonly renderer: Renderer2 = inject(Renderer2);
    /** Имя элемента из атрибута; без статического атрибута — `null`, как прежде с `@Attribute`. */
    public readonly name: string = inject(new HostAttributeToken('rtElem'), { optional: true }) as string;
    public readonly rtMod: InputSignal<TMods | undefined> = input<TMods | undefined>(undefined);
    public blockName: string = this.#rtBlock.name;

    constructor() {
        this.renderer.addClass(this.element.nativeElement, generateClass(this.#rtBlock.name, this.name));

        effect((): void => {
            const mods: TModsObject = parseMods(this.rtMod());

            setMods(this.blockName, this.name, mods, this.#mods, this.element, this.renderer);

            this.#mods = this.#mods === mods ? Object.assign({}, mods) : mods;
        });
    }
}
