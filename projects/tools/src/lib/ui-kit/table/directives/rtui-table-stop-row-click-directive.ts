import { Directive, ElementRef, inject, OnInit } from '@angular/core';

import { RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE } from '../util';

@Directive({
    selector: '[rtuiTableStopRowClickDirective]',
    standalone: true,
})
export class RtuiTableStopRowClickDirective implements OnInit {
    readonly #elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

    public ngOnInit(): void {
        this.#elementRef.nativeElement.setAttribute(RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE, '');
    }
}
