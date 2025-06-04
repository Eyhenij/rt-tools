import { Directive, ElementRef, inject, OnInit } from '@angular/core';

import { RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE } from '../util';
import { PlatformService } from '../../../util';

@Directive({
    standalone: true,
    selector: '[rtStopTableRowClick]',
})
export class RtuiStopTableRowClickDirective implements OnInit {
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

    public ngOnInit(): void {
        if (this.#platformService.isPlatformBrowser) {
            this.#elementRef.nativeElement.setAttribute(RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE, '');
        }
    }
}
