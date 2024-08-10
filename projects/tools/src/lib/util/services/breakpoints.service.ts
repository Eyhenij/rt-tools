import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { map } from 'rxjs/operators';

import { Nullable } from '../../util/interfaces/nullable.type';
import { Breakpoints } from './breakpoints';
import { IBreakpoints } from './breakpoints.model';

/**
 * A service that manages responsive design breakpoints using Angular's `BreakpointObserver`.
 * This service provides signals for different screen sizes and allows dynamic
 * breakpoint management.
 *
 * @Injectable
 */
@Injectable()
export class BreakpointService {
    /**
     * Private instance of BreakpointObserver used to observe screen size changes.
     */
    readonly #breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
    /**
     * Instance of a lass containing the breakpoint values for different screen sizes.
     */
    readonly #breakpoints: IBreakpoints = new Breakpoints();

    readonly #desktopQuery: string = `(min-width: ${this.#breakpoints.xl})`;
    readonly #smallDesktopQuery: string = `(min-width: ${this.#breakpoints.lg})`;
    readonly #tabletQuery: string = `(min-width: ${this.#breakpoints.md})`;
    readonly #smallTabletQuery: string = `(min-width: ${this.#breakpoints.sm})`;
    readonly #mobileQuery: string = `(max-width: ${this.decrementOnePixel(this.#breakpoints.xs)})`;

    public readonly isDesktop: Signal<Nullable<boolean>> = toSignal<Nullable<boolean>>(
        this.#breakpointObserver.observe(this.#desktopQuery).pipe(map(({ matches }: BreakpointState) => matches))
    );

    public readonly isSmallDesktop: Signal<Nullable<boolean>> = toSignal<Nullable<boolean>>(
        this.#breakpointObserver.observe(this.#smallDesktopQuery).pipe(map(({ matches }: BreakpointState) => matches))
    );

    public readonly isMobile: Signal<Nullable<boolean>> = toSignal<Nullable<boolean>>(
        this.#breakpointObserver.observe(this.#mobileQuery).pipe(map(({ matches }: BreakpointState) => matches))
    );

    public readonly isTablet: Signal<Nullable<boolean>> = toSignal<Nullable<boolean>>(
        this.#breakpointObserver.observe(this.#tabletQuery).pipe(map(({ matches }: BreakpointState) => !matches))
    );

    public readonly isSmallTablet: Signal<Nullable<boolean>> = toSignal<Nullable<boolean>>(
        this.#breakpointObserver.observe(this.#smallTabletQuery).pipe(map(({ matches }: BreakpointState) => matches))
    );

    /**
     * Allows setting custom breakpoints for different screen sizes.
     *
     * @param breakpoints - The custom breakpoints to apply.
     */
    public setBreakpoints(breakpoints: IBreakpoints): void {
        Object.assign(this.#breakpoints, breakpoints);
    }

    /**
     * Helper function to decrement the pixel value by 1.
     * Used to exclude the exact pixel value in media queries.
     *
     * @usageNotes
     *
     * This function is useful for setting correct media queries.
     * E.g. for mobile devices: media query should be `(max-width: 599px)`,
     * and from `(min-width: 600px)` it should be considered as a tablet.
     *
     * @param value - The pixel value to decrement.
     * @returns The adjusted pixel value as a string.
     */
    public decrementOnePixel(value: string): string {
        return Number(value.split('px')[0]) - 1 + 'px';
    }
}
