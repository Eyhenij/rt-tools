import { DestroyRef, Directive, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { filter, take } from 'rxjs/operators';

@Directive({
    standalone: true,
})
export abstract class RtTabQueryParamDirective implements OnInit {
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    public readonly currentTabIndex: WritableSignal<number> = signal(0);

    public ngOnInit(): void {
        this.#route.queryParamMap
            .pipe(filter(Boolean), take(1), takeUntilDestroyed(this.#destroyRef))
            .subscribe((params: ParamMap): void => this.currentTabIndex.set(Number(params.get('tab'))));
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
}
