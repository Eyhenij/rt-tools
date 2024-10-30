import { DestroyRef, Directive, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { filter, map, take } from 'rxjs/operators';

@Directive({
    standalone: true,
})
export abstract class RtTabQueryParamDirective implements OnInit {
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #currentTabIndex: WritableSignal<number> = signal(0);
    public readonly currentTabIndex: Signal<number> = this.#currentTabIndex.asReadonly();

    public ngOnInit(): void {
        this.#route.queryParamMap
            .pipe(
                filter((params: ParamMap) => params.has('tab')),
                take(1),
                map((params: ParamMap) => Number(params.get('tab'))),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((tabIndex: number) => {
                this.#setTabIndex(tabIndex);
            });
    }

    public setQueryTab(index: number): void {
        void this.#router.navigate([], {
            relativeTo: this.#route,
            queryParams: {
                tab: index,
            },
            queryParamsHandling: 'merge',
        });
    }

    #setTabIndex(index: number): void {
        this.#currentTabIndex.set(index);
    }
}
