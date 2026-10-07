import { ChangeDetectionStrategy, Component, Injector, Signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { Observable, filter, map, take } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { ERedirectType } from '@rt-tools/cms-contract';
import { CMS_LABELS, IRedirectListRow, REDIRECT_TYPE_TITLES, TCmsLabelMap, interpolateCmsLabel } from '@rt-tools/cms-angular';
import {
    IRtSelect,
    RtAsideComponent,
    RtAsideFooterComponent,
    RtAsideHeaderComponent,
    RtButtonDirective,
    RtContainerRightSidenavPanelDirective,
    RtFieldComponent,
    RtInputComponent,
    RtMessageComponent,
    RtRouteAsideComponent,
    RtSelectComponent,
} from '@rt-tools/ui-kit-v2';

import { RedirectsStore, redirectRefusalOf } from '../../store/redirects.store';

const BEM_BLOCK: string = 'rt-cms-redirect-aside';

/** The panel fields: from where, to where and the kind. */
interface IRedirectForm {
    from: FormControl<string>;
    to: FormControl<string>;
    type: FormControl<ERedirectType>;
}

/** The required check is called through a wrapper: it is a static method and loses its `this` when passed by reference. */
function required(control: AbstractControl): ValidationErrors | null {
    return Validators.required(control);
}

/**
 * The panel that creates and edits a redirect: from where, to where and the kind. Creating and
 * editing are one component on two routes. The server does not accept a second redirect from the
 * same address, and the panel stays open and names the reason: what was typed is not lost.
 */
@Component({
    selector: 'rt-cms-redirect-aside',
    templateUrl: './cms-redirect-aside.component.html',
    styleUrl: './cms-redirect-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtContainerRightSidenavPanelDirective,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
        RtSelectComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsRedirectAsideComponent extends RtRouteAsideComponent<IRedirectListRow> {
    readonly #store: RedirectsStore = inject(RedirectsStore);
    readonly #injector: Injector = inject(Injector);

    protected override readonly idParamName: string = 'redirectId';

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly typeOptions: Signal<readonly IRtSelect.Option<ERedirectType>[]> = computed(
        (): readonly IRtSelect.Option<ERedirectType>[] => {
            const labels: TCmsLabelMap = this.t();

            return [
                {
                    label: interpolateCmsLabel(labels.redirectPermanent, { code: REDIRECT_TYPE_TITLES[ERedirectType.MovedPermanently] }),
                    value: ERedirectType.MovedPermanently,
                },
                {
                    label: interpolateCmsLabel(labels.redirectTemporary, { code: REDIRECT_TYPE_TITLES[ERedirectType.Found] }),
                    value: ERedirectType.Found,
                },
            ];
        }
    );
    protected readonly title: Signal<string> = computed((): string =>
        this.isCreateMode() ? this.t().redirectsNew : this.t().redirectTitle
    );

    protected readonly form: FormGroup<IRedirectForm> = new FormGroup<IRedirectForm>({
        from: new FormControl<string>('', { nonNullable: true, validators: [required] }),
        to: new FormControl<string>('', { nonNullable: true, validators: [required] }),
        type: new FormControl<ERedirectType>(ERedirectType.MovedPermanently, { nonNullable: true }),
    });

    constructor() {
        super();

        this.guardUnsavedChanges({
            pristine: this.pristineSignal(this.form),
            save: (): void => {
                this.save();
            },
        });
    }

    /**
     * The redirect is taken from the list page under the panel: the section has no other way to read
     * one redirect. On a reload the panel is created before the list, and an empty list at that
     * minute is an answer not yet come, not a missing redirect.
     */
    protected override resolve(redirectId: string): Observable<IRedirectListRow | null> {
        return toObservable(this.#store.loaded, { injector: this.#injector }).pipe(
            filter((loaded: boolean): boolean => loaded),
            take(1),
            map((): IRedirectListRow | null => this.#store.rows().find((row: IRedirectListRow): boolean => row.id === redirectId) ?? null)
        );
    }

    protected override onResolved(): void {
        const row: IRedirectListRow | null = this.entity();
        this.form.setValue({
            from: row?.from ?? '',
            to: row?.to ?? '',
            type: row?.type ?? ERedirectType.MovedPermanently,
        });
        this.form.markAsPristine();
    }

    protected save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            return;
        }

        const value: { from: string; to: string; type: ERedirectType } = this.form.getRawValue();
        this.runMutation(this.#store.save({ ...value, id: this.entity()?.id ?? '' }), {
            closeOnSuccess: true,
            successText: this.t().redirectSaved,
            errorText: (error: unknown): string => this.t()[redirectRefusalOf(error)],
        });
    }
}
