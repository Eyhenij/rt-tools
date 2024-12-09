import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { faker } from '@faker-js/faker';

import { BlockDirective, ElemDirective } from '../../../../../bem';
import { RtIconOutlinedDirective } from '../../../../../util';
import { RtuiDynamicInputAdditionalControlDirective } from '../../../components';
import { RtuiDynamicInputComponent } from '../../../components/dynamic-input/rtui-dynamic-input.component';

export const createEmail: () => string = (): string => {
    return faker.internet.email();
};
export const createEmailsList: (size: number) => string[] = (size: number) => Array.from({ length: size }, createEmail);

@Component({
    selector: 'app-dynamic-input',
    templateUrl: './test-dynamic-input.component.html',
    styleUrls: ['./test-dynamic-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatIcon,
        MatIconButton,
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
        RtIconOutlinedDirective,
        RtuiDynamicInputAdditionalControlDirective,

        // components
        RtuiDynamicInputComponent,
    ],
})
export class TestDynamicInputComponent implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    public form: FormControl = new FormControl([]);
    public isMobile: boolean = false;
    public isSingleSelection: boolean = false;
    public isListDraggable: boolean = false;
    public isAdditionalControlShown: boolean = false;

    public ngOnInit(): void {
        this.form.patchValue(createEmailsList(3));

        this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((value: string[]) => {
            // eslint-disable-next-line no-console
            console.log('Selection changed: ', value);
        });
    }

    public onAdditionalControlClick(entity: string): void {
        // eslint-disable-next-line no-console
        console.log('Selection changed: ', entity);
    }
}
