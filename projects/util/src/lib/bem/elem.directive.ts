import { Attribute, Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

import { ModsObject } from './bem.types';
import { BlockDirective } from './block.directive';
import { generateClass, parseMods, setMods } from './bem.utils';

@Directive({
    selector: '[rtElem]',
    standalone: true,
})
export class ElemDirective implements OnChanges {
    @Input() public rtMod?: string | string[] | ModsObject;
    public blockName: string;
    #mods: ModsObject = {};
    #modSerialized: string = '';

    constructor(
        public readonly element: ElementRef,
        public readonly renderer: Renderer2,
        @Attribute('rtElem') public readonly name: string,
        private readonly rtBlock: BlockDirective,
    ) {
        this.blockName = rtBlock.name;

        renderer.addClass(element.nativeElement, generateClass(rtBlock.name, name));
    }

    public ngOnChanges(): void {
        if (JSON.stringify(this.rtMod) !== this.#modSerialized) {
            this.#modSerialized = JSON.stringify(this.rtMod);

            let mods: string | string[] | ModsObject | undefined = this.rtMod;

            const { renderer, element, blockName, name } = this;

            mods = parseMods(mods);

            setMods(blockName, name, mods, this.#mods || {}, element, renderer);

            this.#mods = this.#mods === mods ? Object.assign({}, mods) : mods;
        }
    }
}
