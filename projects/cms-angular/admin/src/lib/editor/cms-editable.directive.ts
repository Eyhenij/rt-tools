import { Directive, ElementRef, inject, input, InputSignal, OnInit, output, OutputEmitterRef } from '@angular/core';

import { editableNodesOf } from '@rt-tools/cms-angular';

/**
 * An editable piece of block HTML. The markup is put into the element once, on appearing: from
 * then on the person owns the element, and a redraw from the value would knock the caret off. The
 * markup goes in as nodes cleaned by the allow list of a paste, never as a string: a script or an
 * event handler stored in a block does not reach the page of the editor. Every edit goes out as a
 * string; text without letters goes out empty, and the element is cleared to show the placeholder.
 */
@Directive({
    selector: '[rtCmsEditable]',
    host: {
        contenteditable: 'true',
        '(input)': 'onInput()',
    },
})
export class CmsEditableDirective implements OnInit {
    readonly #element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    public readonly rtCmsEditable: InputSignal<string> = input.required<string>();
    public readonly htmlChange: OutputEmitterRef<string> = output<string>();

    public ngOnInit(): void {
        this.#element.replaceChildren(editableNodesOf(this.rtCmsEditable()));
    }

    protected onInput(): void {
        if (!this.#element.textContent.trim()) {
            this.#element.replaceChildren();
        }
        this.htmlChange.emit(this.#element.innerHTML);
    }
}
