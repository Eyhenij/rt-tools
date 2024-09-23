import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { faker } from '@faker-js/faker';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtIconOutlinedDirective } from '../../../../util';
import { RtuiDynamicSelectorAdditionalControlDirective, RtuiDynamicSelectorComponent } from '../../components';

export type Person = {
    id: number;
    name: string;
};

export const createPerson: () => Person = (): Person => {
    const gender: 'male' | 'female' = faker.number.int({ min: 0, max: 1 }) ? 'male' : 'female';

    return {
        id: faker.number.int(),
        name: `${faker.person.firstName(gender)} ${faker.person.lastName(gender)} ${faker.person.middleName(gender)} ${faker.person.middleName(gender)} ${faker.person.middleName(gender)}`,
    };
};

export const createPersonList: (size: number) => Person[] = (size: number) => Array.from({ length: size }, createPerson);

export const listOfPersons: Person[] = createPersonList(15);

@Component({
    standalone: true,
    selector: 'app-selector',
    templateUrl: './test-selector.component.html',
    styleUrls: ['./test-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,

        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiDynamicSelectorComponent,
        RtuiDynamicSelectorAdditionalControlDirective,
        MatIcon,
        MatIconButton,
        MatTooltip,
        RtIconOutlinedDirective,
    ],
})
export class TestSelectorComponent implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    public form: FormControl = new FormControl([]);

    public isMobile: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public isAdditionalControlShown: boolean = false;
    public isMultiToggleShown: boolean = false;
    public hasReadonly: boolean = false;
    public isSingleMode: boolean = false;
    public entities: Person[] = [];
    public readonlyEntitiesKeys: number[] = [listOfPersons[1].id];

    public ngOnInit(): void {
        this.form.patchValue(listOfPersons.slice(1, 4).map((el: Person) => el.id));

        this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((value: number[]) => {
            // eslint-disable-next-line no-console
            console.log('Selection changed: ', value);
        });
    }

    public onAdditionalControlClick(entity: Person): void {
        // eslint-disable-next-line no-console
        console.log('Selection changed: ', entity);
    }
}
