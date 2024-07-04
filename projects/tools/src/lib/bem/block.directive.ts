import { Attribute, Directive, ElementRef, Input, OnChanges, Optional, Renderer2 } from '@angular/core';
import { ModsObject } from './bem.types';
import { generateClass, parseMods, setMods } from './bem.utils';

@Directive({
    selector: '[rtBlock]',
    standalone: true,
})
export class BlockDirective implements OnChanges {
    @Input() public rtMod?: string | string[] | (string | false)[] | ModsObject;
    #mods: ModsObject = {};
    #modSerialized: string = '';

    constructor(
        public readonly element: ElementRef,
        public readonly renderer: Renderer2,
        @Attribute('rtBlock') public readonly name: string,
        @Optional() @Attribute('rtElem') private readonly elem: string,
    ) {
        if (!elem) {
            !(element.nativeElement instanceof Comment) && renderer.addClass(element.nativeElement, generateClass(name));
        }
    }

    public ngOnChanges(): void {
        if (JSON.stringify(this.rtMod) !== this.#modSerialized && !this.elem) {
            this.#modSerialized = JSON.stringify(this.rtMod);

            let mods: string | string[] | (string | false)[] | ModsObject | undefined = this.rtMod;

            const { renderer, element, name } = this;

            mods = parseMods(mods);

            !(element.nativeElement instanceof Comment) && setMods(name, '', mods, this.#mods || {}, element, renderer);

            this.#mods = this.#mods === mods ? Object.assign({}, mods) : mods;
        }
    }
}
