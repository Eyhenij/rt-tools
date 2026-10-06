import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RtAuthService, RtIfPermissionDirective } from '@rt-tools/auth-angular';
import { ICaller } from '@rt-tools/auth-contract';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective, RtEmptyStateComponent, RtFieldComponent, RtInputComponent, RtMessageComponent } from '@rt-tools/ui-kit-v2';
import { catchError, concatMap, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

import { RecordsApiService } from './records-api.service';
import { IRecordLine, refusalText } from './records.logic';

const BEM_BLOCK: string = 'example-records';

/**
 * The records page: the list for a reader, the form of a new record for an editor, the exit.
 *
 * The form is hidden from a person without the right to write; the server refuses such a call by
 * itself, and its refusal is shown above the list in words.
 */
@Component({
    selector: 'example-records',
    templateUrl: './records.page.html',
    styleUrl: './records.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // directives
        RtButtonDirective,
        RtIfPermissionDirective,

        // components
        RtEmptyStateComponent,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class RecordsPage {
    readonly #auth: RtAuthService = inject(RtAuthService);
    readonly #api: RecordsApiService = inject(RecordsApiService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #loadSource: Subject<void> = new Subject<void>();
    readonly #createSource: Subject<string> = new Subject<string>();

    protected readonly records: WritableSignal<readonly IRecordLine[]> = signal<readonly IRecordLine[]>([]);
    protected readonly refusal: WritableSignal<string | null> = signal<string | null>(null);
    protected readonly title: FormControl<string> = new FormControl<string>('', { nonNullable: true });
    protected readonly canRead: Signal<boolean> = computed((): boolean => this.#auth.meets({ every: ['example:read'] }));
    protected readonly personName: Signal<string> = computed((): string => {
        const caller: ICaller | null = this.#auth.caller();
        return caller?.name ?? caller?.email ?? '';
    });

    constructor() {
        this.#loadSource
            .pipe(
                switchMap((): Observable<IRecordLine[]> => this.#api.list().pipe(catchError((error: unknown) => this.#refused(error)))),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((records: IRecordLine[]): void => this.records.set(records));

        this.#createSource
            .pipe(
                concatMap((title: string): Observable<IRecordLine> =>
                    this.#api.create(title).pipe(catchError((error: unknown) => this.#refused(error)))
                ),
                tap((): void => this.title.reset()),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((): void => this.#loadSource.next());

        if (this.canRead()) {
            this.#loadSource.next();
        }
    }

    protected reload(): void {
        this.refusal.set(null);
        this.#loadSource.next();
    }

    protected create(): void {
        this.refusal.set(null);
        this.#createSource.next(this.title.value);
    }

    protected signOut(): void {
        void this.#auth.logout();
    }

    #refused(error: unknown): Observable<never> {
        this.refusal.set(refusalText(error instanceof HttpErrorResponse ? error.status : 0));
        return EMPTY;
    }
}
