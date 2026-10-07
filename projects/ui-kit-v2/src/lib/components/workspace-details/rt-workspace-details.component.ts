import { BooleanInput } from '@angular/cdk/coercion';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    untracked,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { NotificationBus } from '@rt-tools/ui-kit-v2/core';

import { RtAsideSectionComponent } from '@rt-tools/ui-kit-v2/aside-section';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtConfirmDirective } from '@rt-tools/ui-kit-v2/confirm-popover';
import { RtDetailListComponent } from '@rt-tools/ui-kit-v2/detail-list';
import { RtDetailRowComponent } from '@rt-tools/ui-kit-v2/detail-list';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtFieldComponent } from '@rt-tools/ui-kit-v2/field';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtMoneyListComponent } from '@rt-tools/ui-kit-v2/money-list';
import { RtMoneyRowComponent } from '@rt-tools/ui-kit-v2/money-list';
import { RtNoteComponent } from '@rt-tools/ui-kit-v2/note';
import { RtSelectComponent } from '@rt-tools/ui-kit-v2/select';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtTabDirective } from '@rt-tools/ui-kit-v2/tabs';
import { RtTabsComponent } from '@rt-tools/ui-kit-v2/tabs';
import { RtTextareaComponent } from '@rt-tools/ui-kit-v2/textarea';
import { RtTimelineComponent } from '@rt-tools/ui-kit-v2/timeline';
import { RtToggleSwitchComponent } from '@rt-tools/ui-kit-v2/toggle-switch';
import { IRtWorkspaceDetails } from './rt-workspace-details.model';

const BEM_BLOCK: string = 'rt-workspace-details';

interface ITransitionFormShape {
    to_key: FormControl<string | null>;
    note: FormControl<string | null>;
}

@Component({
    selector: 'rt-workspace-details',
    templateUrl: './rt-workspace-details.component.html',
    styleUrls: ['./rt-workspace-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        DecimalPipe,
        FormsModule,
        NgTemplateOutlet,
        ReactiveFormsModule,

        // standalone components / directives
        RtAsideSectionComponent,
        RtButtonDirective,
        RtConfirmDirective,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtEmptyStateComponent,
        RtFieldComponent,
        RtIconButtonComponent,
        RtMoneyListComponent,
        RtMoneyRowComponent,
        RtNoteComponent,
        RtSelectComponent,
        RtSpinnerComponent,
        RtTabDirective,
        RtTabsComponent,
        RtTextareaComponent,
        RtTimelineComponent,
        RtToggleSwitchComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtWorkspaceDetailsComponent {
    readonly #notificationBus: NotificationBus = inject(NotificationBus);

    readonly #lastEntityId: WritableSignal<number | null | undefined> = signal<number | null | undefined>(undefined);

    readonly #lastAgentId: WritableSignal<number | null | undefined> = signal<number | null | undefined>(undefined);

    #lastTransitionSuccess: string | null = null;

    #lastTransitionError: string | null = null;

    #lastTransitionSubmitError: string | null = null;

    #lastAuditError: string | null = null;

    #lastPanelError: string | null = null;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly editingAgent: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly selectedAgentId: WritableSignal<number | null> = signal<number | null>(null);

    protected readonly transitionForm: FormGroup<ITransitionFormShape> = new FormGroup<ITransitionFormShape>({
        to_key: new FormControl<string | null>(null, {
            validators: [Validators.required],
        }),
        note: new FormControl<string | null>(null),
    });

    protected readonly hasTabs: Signal<boolean> = computed((): boolean => this.transition() !== null || this.audit() !== null);

    protected readonly noTransitions: Signal<boolean> = computed((): boolean => {
        const transition: IRtWorkspaceDetails.Transition | null = this.transition();
        return transition !== null && !transition.loading && transition.error === null && transition.options.length === 0;
    });

    protected readonly canSaveReassign: Signal<boolean> = computed((): boolean => {
        const edit: IRtWorkspaceDetails.AgentEdit | null = this.agentEdit();
        const selected: number | null = this.selectedAgentId();
        return edit !== null && selected !== null && selected !== edit.currentAgentId;
    });

    public readonly title: InputSignal<string | null> = input<string | null>(null);

    public readonly entityId: InputSignal<number | null> = input<number | null>(null);

    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly busy: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly rows: InputSignal<readonly IRtWorkspaceDetails.Row[]> = input<readonly IRtWorkspaceDetails.Row[]>([]);

    public readonly agentEdit: InputSignal<IRtWorkspaceDetails.AgentEdit | null> = input<IRtWorkspaceDetails.AgentEdit | null>(null);

    public readonly money: InputSignal<readonly IRtWorkspaceDetails.MoneyRow[]> = input<readonly IRtWorkspaceDetails.MoneyRow[]>([]);

    public readonly toggles: InputSignal<readonly IRtWorkspaceDetails.Toggle[]> = input<readonly IRtWorkspaceDetails.Toggle[]>([]);

    public readonly toggleHint: InputSignal<string | null> = input<string | null>(null);

    public readonly transition: InputSignal<IRtWorkspaceDetails.Transition | null> = input<IRtWorkspaceDetails.Transition | null>(null);

    public readonly audit: InputSignal<IRtWorkspaceDetails.Audit | null> = input<IRtWorkspaceDetails.Audit | null>(null);

    public readonly actions: InputSignal<readonly IRtWorkspaceDetails.Action[]> = input<readonly IRtWorkspaceDetails.Action[]>([]);

    public readonly error: InputSignal<string | null> = input<string | null>(null);

    public readonly toggleChange: OutputEmitterRef<IRtWorkspaceDetails.ToggleChange> = output<IRtWorkspaceDetails.ToggleChange>();

    public readonly agentReassign: OutputEmitterRef<number> = output<number>();

    public readonly transitionSubmit: OutputEmitterRef<IRtWorkspaceDetails.TransitionSubmit> =
        output<IRtWorkspaceDetails.TransitionSubmit>();

    public readonly transitionSuccessClose: OutputEmitterRef<void> = output<void>();

    public readonly transitionErrorClose: OutputEmitterRef<void> = output<void>();

    public readonly auditLoadMore: OutputEmitterRef<void> = output<void>();

    public readonly actionClicked: OutputEmitterRef<string> = output<string>();

    constructor() {
        effect((): void => {
            const id: number | null = this.entityId();
            if (id === untracked((): number | null | undefined => this.#lastEntityId())) {
                return;
            }
            this.#lastEntityId.set(id);
            this.editingAgent.set(false);
            this.selectedAgentId.set(untracked((): IRtWorkspaceDetails.AgentEdit | null => this.agentEdit())?.currentAgentId ?? null);
            this.transitionForm.reset();
        });

        effect((): void => {
            const currentAgentId: number | null = this.agentEdit()?.currentAgentId ?? null;
            if (currentAgentId === untracked((): number | null | undefined => this.#lastAgentId())) {
                return;
            }
            this.#lastAgentId.set(currentAgentId);
            this.editingAgent.set(false);
            this.selectedAgentId.set(currentAgentId);
        });

        effect((): void => {
            if (this.transition()?.success != null) {
                this.transitionForm.reset();
            }
        });

        effect((): void => {
            const successText: string | null = this.transition()?.success ?? null;
            if (successText !== null && successText !== this.#lastTransitionSuccess) {
                this.transitionSuccessClose.emit();
            }
            this.#lastTransitionSuccess = successText;
        });

        effect((): void => {
            const submitError: string | null = this.transition()?.submitError ?? null;
            if (submitError !== null && submitError !== this.#lastTransitionSubmitError) {
                this.#notificationBus.error(submitError);
                this.transitionErrorClose.emit();
            }
            this.#lastTransitionSubmitError = submitError;
        });

        effect((): void => {
            const transitionError: string | null = this.transition()?.error ?? null;
            if (transitionError !== null && transitionError !== this.#lastTransitionError) {
                this.#notificationBus.error(transitionError);
            }
            this.#lastTransitionError = transitionError;
        });

        effect((): void => {
            const auditError: string | null = this.audit()?.error ?? null;
            if (auditError !== null && auditError !== this.#lastAuditError) {
                this.#notificationBus.error(auditError);
            }
            this.#lastAuditError = auditError;
        });

        effect((): void => {
            const panelError: string | null = this.error();
            if (panelError !== null && panelError !== this.#lastPanelError) {
                this.#notificationBus.error(panelError);
            }
            this.#lastPanelError = panelError;
        });
    }

    protected startEditAgent(): void {
        const edit: IRtWorkspaceDetails.AgentEdit | null = this.agentEdit();
        if (edit === null || !edit.canEdit || this.busy()) {
            return;
        }
        this.selectedAgentId.set(edit.currentAgentId);
        this.editingAgent.set(true);
    }

    protected cancelEditAgent(): void {
        const edit: IRtWorkspaceDetails.AgentEdit | null = this.agentEdit();
        if (edit !== null && edit.loading) {
            return;
        }
        this.selectedAgentId.set(edit?.currentAgentId ?? null);
        this.editingAgent.set(false);
    }

    protected onReassign(): void {
        const agentId: number | null = this.selectedAgentId();
        if (agentId === null || !this.canSaveReassign() || this.busy()) {
            return;
        }
        this.agentReassign.emit(agentId);
    }

    protected onSelectedAgentChange(agentId: number | null): void {
        this.selectedAgentId.set(agentId);
    }

    protected onToggleChange(toggle: IRtWorkspaceDetails.Toggle, value: boolean): void {
        if (toggle.value === value) {
            return;
        }
        this.toggleChange.emit({ id: toggle.id, value });
    }

    protected onTransitionSubmit(): void {
        const transition: IRtWorkspaceDetails.Transition | null = this.transition();
        if (transition === null || transition.submitting) {
            return;
        }
        if (!this.transitionForm.valid) {
            this.transitionForm.markAllAsTouched();
            return;
        }

        const value: ReturnType<typeof this.transitionForm.getRawValue> = this.transitionForm.getRawValue();
        this.transitionSubmit.emit({
            stageKey: value.to_key ?? '',
            comment: value.note?.trim() ?? '',
        });
    }

    protected onAuditLoadMore(): void {
        this.auditLoadMore.emit();
    }

    protected onAction(action: IRtWorkspaceDetails.Action): void {
        if ((action.disabled ?? false) || this.busy()) {
            return;
        }
        this.actionClicked.emit(action.id);
    }
}
