import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    OnInit,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatBadge } from '@angular/material/badge';
import { MatFormField, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTab, MatTabContent, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { ASIDE_BUTTONS_ENUM, ASIDE_REF, AsideRef, IAside, Nullable } from '../../../../util';
import { RtuiAsideContainerComponent, RtuiAsideContainerHeaderDirective } from '../../components/container/aside-container.component';

@Component({
    selector: 'rtui-test-aside',
    templateUrl: './test-aside.component.html',
    styleUrls: ['./test-aside.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatInput,
        MatFormField,
        MatSelect,
        MatOption,
        MatLabel,
        MatError,

        BlockDirective,
        ElemDirective,

        // standalone components
        RtuiAsideContainerComponent,
        RtuiAsideContainerHeaderDirective,
        MatTabGroup,
        MatTabLabel,
        MatTooltip,
        MatTabContent,
        MatIcon,
        MatTab,
        MatBadge,
    ],
    providers: [],
})
export class TestAsideComponent implements OnInit {
    readonly #fb: FormBuilder = inject(FormBuilder);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    public form: FormGroup = new FormGroup({});
    public saveButtonDisabled: boolean = true;

    public readonly asideRef: AsideRef<object, object> = inject(ASIDE_REF);
    public readonly appearance: MatFormFieldAppearance = 'outline';

    public readonly headerActionsButtons: Signal<IAside.HeaderActionButton[]> = signal([
        { name: ASIDE_BUTTONS_ENUM.DELETE, icon: 'delete', color: 'red', tooltip: 'Button example' },
        { name: ASIDE_BUTTONS_ENUM.RESET, icon: 'undo', color: 'gray', tooltip: 'Button example' },
    ]);
    public readonly requestError: Signal<HttpErrorResponse> = signal(
        new HttpErrorResponse({
            error: { message: 'Not Found' },
            status: 404,
            statusText: 'Not Found',
            url: 'https://api.example.com/data',
        })
    );
    public readonly selectedTabIndex: WritableSignal<number> = signal(0);

    public ngOnInit(): void {
        this.form = this.#fb.group({
            name: this.#fb.control<Nullable<string>>(null, Validators.required),
            email: this.#fb.control<Nullable<string>>(null, [Validators.required, Validators.email]),
            statuses: this.#fb.control<Nullable<string>>(null, Validators.required),
            description: this.#fb.control<Nullable<string>>(null),
            description1: this.#fb.control<Nullable<string>>(null),
        });

        this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
            this.saveButtonDisabled = this.form.invalid || this.form.pristine;
            this.#cdr.markForCheck();
        });

        this.form.markAllAsTouched();
        this.form.updateValueAndValidity();
    }

    public create(): void {
        if (this.form.invalid) {
            return;
        }

        this.asideRef.close(this.form.value);
    }

    public cancel(): void {
        this.asideRef.close();
    }
}
