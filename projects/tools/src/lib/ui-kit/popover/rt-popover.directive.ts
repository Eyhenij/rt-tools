import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ComponentRef,
    Directive,
    ElementRef,
    HostListener,
    inject,
    Injector,
    input,
    InputSignalWithTransform,
    numberAttribute,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { computePosition, ComputePositionReturn, flip, offset, shift } from '@floating-ui/dom';

import { Nullable, PlatformService, WINDOW } from '../../util';
import { RtuiPopoverContainerComponent } from './rtui-popover-container.component';

export type MenuItemTrigger = 'click' | 'hover';

@Directive({
    selector: '[rtPopover]',
    providers: [PlatformService],
})
export class RtPopoverDirective implements OnInit, OnDestroy {
    readonly #windowRef: Window = inject(WINDOW);
    readonly #injector: Injector = inject(Injector);
    readonly #hostRef: ElementRef = inject(ElementRef);
    readonly #documentRef: Document = inject(DOCUMENT);
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #componentFactoryResolver: ViewContainerRef = inject(ViewContainerRef);

    #popoverContainerRef?: ComponentRef<RtuiPopoverContainerComponent> | null;
    #popoverElement?: HTMLElement;
    #hasPopoverHover: boolean = false;
    #hasHostHover: boolean = false;

    public xOffset: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(0, { transform: numberAttribute });
    public yOffset: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(-20, { transform: numberAttribute });
    public trigger: InputSignalWithTransform<MenuItemTrigger, MenuItemTrigger> = input<MenuItemTrigger, MenuItemTrigger>('hover', {
        transform: (value: unknown) => (value === 'click' ? 'click' : 'hover'),
    });
    public template: InputSignalWithTransform<Nullable<TemplateRef<HTMLElement>>, Nullable<TemplateRef<HTMLElement>>> = input<
        Nullable<TemplateRef<HTMLElement>>,
        Nullable<TemplateRef<HTMLElement>>
    >(null, {
        transform: (value: Nullable<TemplateRef<HTMLElement>>) => value || null,
    });
    public isMouseHoverAllowed: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    @HostListener('document:click', ['$event.target'])
    public onClick(element: HTMLElement): void {
        if (this.trigger() === 'click') {
            if (this.#hostRef.nativeElement.contains(element)) {
                this.#show();
            } else {
                this.#hide();
            }
        }
    }

    @HostListener('mouseenter')
    public onMouseEnter(): void {
        if (this.trigger() === 'hover') {
            this.#hasHostHover = true;
            this.#show();
        }
    }

    @HostListener('mouseleave')
    public onMouseLeave(): void {
        this.#hasHostHover = false;
        this.#handleMouseLeave();
    }

    public ngOnInit(): void {
        if (this.#platformService.isPlatformBrowser) {
            this.#windowRef.addEventListener('scroll', this.#hide.bind(this));
        }
    }

    public ngOnDestroy(): void {
        this.onMouseLeave();
    }

    #show(): void {
        if (!this.#platformService.isPlatformBrowser || this.#popoverContainerRef) {
            return;
        }
        this.#popoverContainerRef = this.#componentFactoryResolver.createComponent(RtuiPopoverContainerComponent, {
            injector: this.#injector,
        });

        this.#popoverContainerRef.instance.popoverTemplate = this.template || null;

        this.#popoverElement = this.#popoverContainerRef.location.nativeElement;

        if (this.#popoverElement) {
            this.#documentRef.body.appendChild(this.#popoverElement);
            this.#popoverElement.addEventListener('mouseenter', () => {
                this.#hasPopoverHover = true;
            });
            this.#popoverElement.addEventListener('mouseleave', () => {
                this.#hasPopoverHover = false;
                this.#handleMouseLeave();
            });
        }
        this.#updateTooltipPosition();
        this.#popoverContainerRef.hostView.detectChanges();
    }

    #updateTooltipPosition(): void {
        if (!this.#hostRef?.nativeElement || !this.#popoverElement) {
            return;
        }

        computePosition(this.#hostRef.nativeElement, this.#popoverElement, {
            placement: 'bottom-start',
            middleware: [offset(14), flip(), shift({ padding: 0 })],
        }).then((computePosition: ComputePositionReturn) => {
            const x: number = computePosition.x + this.xOffset();
            const y: number = computePosition.y + this.yOffset();

            if (this.#popoverElement) {
                Object.assign(this.#popoverElement.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    opacity: 1,
                    visibility: 'visible',
                    'z-index': 2,
                });
            }
        });
    }

    #handleMouseLeave(): void {
        if (this.trigger() === 'hover') {
            if (!this.#popoverContainerRef) {
                return;
            }
            if (!this.isMouseHoverAllowed()) {
                this.#hide();
                return;
            }
            setTimeout(() => {
                this.#hide();
            }, 50);
        }
    }

    #hide(): void {
        if (!this.#hasPopoverHover && !this.#hasHostHover && this.#popoverContainerRef) {
            Object.assign(this.#popoverContainerRef.location.nativeElement.style, {
                opacity: 0,
            });
            this.#popoverContainerRef.destroy();
            this.#popoverContainerRef = null;
        }
    }
}
