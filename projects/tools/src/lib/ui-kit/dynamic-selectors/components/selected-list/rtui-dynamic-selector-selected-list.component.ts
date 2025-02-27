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
    Signal,
    TemplateRef,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
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

        // material
        MatIconButton,
        MatIcon,
        MatButton,
        MatTooltip,

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
    /** Indicates if mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input.required<Nullable<boolean>, Nullable<boolean>>({
        transform: booleanAttribute,
    });
    /** A model's field which should be used for http-requests */
    public keyExp: InputSignal<KEY> = input.required();
    /** A model's field which should be shown in ui */
    public displayExp: InputSignal<KEY> = input.required();
    /** Array of selected entities */
    public selectedEntities: InputSignalWithTransform<ENTITY[], ENTITY[]> = input.required<ENTITY[], ENTITY[]>({
        transform: (value: unknown) => transformArrayInput(value),
    });
    /** Entity keys that can't be changed */
    public readonlyEntitiesKeys: InputSignalWithTransform<ENTITY[KEY][], ENTITY[KEY][]> = input<ENTITY[KEY][], ENTITY[KEY][]>([], {
        transform: (value: ENTITY[KEY][]) => transformArrayInput(value),
    });
    /** Indicates is list of items draggable */
    public isListDraggable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is break string pipe used */
    public useNameBreaking: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is title case pipe used */
    public useTitleCase: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is delete entity button from the selected list shown */
    public isDeleteButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });

    /** Additional control for entity */
    public readonly additionalControlTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY }>>> = contentChild(
        RtuiDynamicSelectorItemAdditionalControlDirective,
        {
            read: TemplateRef,
        }
    );

    public readonly deleteFromSelectedAction: OutputEmitterRef<ENTITY[KEY]> = output<ENTITY[KEY]>();
    public readonly dropAction: OutputEmitterRef<CdkDragDrop<ENTITY[]>> = output<CdkDragDrop<ENTITY[]>>();

    public onDelete(value: ENTITY[KEY]): void {
        this.deleteFromSelectedAction.emit(value);
    }

    public onDrop(event: CdkDragDrop<ENTITY[]>): void {
        if (event.currentIndex !== event.previousIndex) {
            this.dropAction.emit(event);
        }
    }
}
