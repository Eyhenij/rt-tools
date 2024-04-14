import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { map } from 'rxjs/operators';

import { Nullable } from '../interfaces';
import { Breakpoints } from './breakpoints';
import { IBreakpoints } from './breakpoints.model';

@Injectable()
export class BreakpointService {
    readonly #breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
    readonly #breakpoints: IBreakpoints = new Breakpoints();

    readonly #desktopQuery: string = `(min-width: ${this.#notIncludeValue(this.#breakpoints.xl)})`;
    readonly #smallDesktopQuery: string = `(min-width: ${this.#notIncludeValue(this.#breakpoints.lg)})`;
    readonly #tabletQuery: string = `(min-width: ${this.#notIncludeValue(this.#breakpoints.md)})`;
    readonly #smallTabletQuery: string = `(min-width: ${this.#notIncludeValue(this.#breakpoints.sm)})`;
    readonly #mobileQuery: string = `(max-width: ${this.#notIncludeValue(this.#breakpoints.xs)})`;

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

    public setBreakpoints(breakpoints: IBreakpoints): void {
        Object.assign(this.#breakpoints, breakpoints);
    }

    #notIncludeValue(value: string): string {
        return Number(value.split('px')[0]) - 1 + 'px';
    }
}
