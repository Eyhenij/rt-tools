import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    TemplateRef,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import {
    BreakStringPipe,
    EntityToStringPipe,
    Nullable,
    RtHideTooltipDirective,
    RtIconOutlinedDirective,
    transformArrayInput,
} from '../../../../util';
import { BooleanInput } from '@angular/cdk/coercion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatFormFieldAppearance } from '@angular/material/form-field';

/** Directive for row actions located outside a row menu button */
@Directive({
    selector: '[rtuiDynamicSelectorItemAdditionalControlDirective]',
})
export class RtuiDynamicSelectorItemAdditionalControlDirective {}

@Component({
    selector: 'rtui-dynamic-selector-selected-list',
    templateUrl: './rtui-dynamic-selector-selected-list.component.html',
    styleUrls: ['./rtui-dynamic-selector-selected-list.component.scss'],
    imports: [
        NgTemplateOutlet,
        FormsModule,
        ReactiveFormsModule,

        // material
        MatIconButton,
        MatIcon,
        MatTooltip,
        MatInput,
        MatFormField,

        // drag and drop
        CdkDropList,
        CdkDrag,
        CdkDragHandle,

        // directives
        RtIconOutlinedDirective,
        RtHideTooltipDirective,
        BlockDirective,
        ElemDirective,

        // pipes
        EntityToStringPipe,
        BreakStringPipe,
        TitleCasePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiDynamicSelectorSelectedListComponent<ENTITY extends Record<string, unknown>, KEY extends Extract<keyof ENTITY, string>> {
    protected readonly editedItemIndex: WritableSignal<Nullable<number>> = signal(null);

    public readonly inputRef: Signal<Nullable<MatInput>> = viewChild(MatInput);

    /** Indicates if mobile view */
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    /** A model's field, which should be used for http-requests */
    public keyExp: InputSignal<KEY> = input.required();
    /** A model's field, which should be shown in ui */
    public displayExp: InputSignal<KEY> = input.required();
    /** Array of selected entities */
    public selectedEntities: InputSignalWithTransform<ENTITY[], ENTITY[]> = input.required<ENTITY[], ENTITY[]>({
        transform: (value: unknown) => transformArrayInput(value),
    });
    /** Entity keys that can't be changed */
    public readonlyEntitiesKeys: InputSignalWithTransform<ENTITY[KEY][], ENTITY[KEY][]> = input<ENTITY[KEY][], ENTITY[KEY][]>([], {
        transform: (value: ENTITY[KEY][]) => transformArrayInput(value),
    });
    /** Indicates is a list of items draggable */
    public isListDraggable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is break string pipe used */
    public useNameBreaking: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is title case pipe used */
    public useTitleCase: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is deleting entity button from the selected list shown */
    public isDeleteButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is items editable */
    public isItemsEditable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Material elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input('fill' as MatFormFieldAppearance);

    public readonly deleteFromSelectedAction: OutputEmitterRef<ENTITY[KEY]> = output<ENTITY[KEY]>();
    public readonly dropAction: OutputEmitterRef<CdkDragDrop<ENTITY[]>> = output<CdkDragDrop<ENTITY[]>>();
    public readonly changeValueAction: OutputEmitterRef<{ prev: ENTITY[KEY]; new: string }> = output<{ prev: ENTITY[KEY]; new: string }>();

    /** Additional control for entity */
    public readonly additionalControlTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY }>>> = contentChild(
        RtuiDynamicSelectorItemAdditionalControlDirective,
        {
            read: TemplateRef,
        }
    );

    protected onDelete(value: ENTITY[KEY]): void {
        this.deleteFromSelectedAction.emit(value);
    }

    protected onDrop(event: CdkDragDrop<ENTITY[]>): void {
        if (event.currentIndex !== event.previousIndex) {
            this.dropAction.emit(event);
        }
    }

    protected changeValue(prev: ENTITY[KEY]): void {
        this.changeValueAction.emit({ prev, new: this.inputRef()?.value || '' });
        this.setEditModState(null);
    }

    protected setEditModState(index: Nullable<number>): void {
        this.editedItemIndex.set(index);
    }
}
