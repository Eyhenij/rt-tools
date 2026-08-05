import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    untracked,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { NotificationBus } from '../../platform';

import { RtAsideSectionComponent } from '../aside-section/rt-aside-section.component';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtConfirmDirective } from '../confirm-popover/rt-confirm.directive';
import { RtDetailListComponent } from '../detail-list/rt-detail-list.component';
import { RtDetailRowComponent } from '../detail-list/rt-detail-row.component';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtFieldComponent } from '../field/rt-field.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtMoneyListComponent } from '../money-list/rt-money-list.component';
import { RtMoneyRowComponent } from '../money-list/rt-money-row.component';
import { RtNoteComponent } from '../note/rt-note.component';
import { RtSelectComponent } from '../select/rt-select.component';
import { RtSpinnerComponent } from '../spinner/rt-spinner.component';
import { RtTabDirective } from '../tabs/rt-tab.directive';
import { RtTabsComponent } from '../tabs/rt-tabs.component';
import { RtTextareaComponent } from '../textarea/rt-textarea.component';
import { RtTimelineComponent } from '../timeline/rt-timeline.component';
import { RtToggleSwitchComponent } from '../toggle-switch/rt-toggle-switch.component';
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
        TranslocoPipe,
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

    public readonly loading: InputSignal<boolean> = input<boolean>(false);

    public readonly busy: InputSignal<boolean> = input<boolean>(false);

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
