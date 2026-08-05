import { IButton } from '../button/rt-button.model';
import { IRtConfirmPopover } from '../confirm-popover/rt-confirm-popover.model';
import { IRtSelect } from '../select/rt-select.model';
import { IRtTimeline } from '../timeline/rt-timeline.model';

export namespace IRtWorkspaceDetails {
    export interface Row {
        label: string;
        value: string;
        agent?: boolean;
    }

    export interface AgentEdit {
        currentLabel: string;
        currentAgentId: number | null;
        options: ReadonlyArray<IRtSelect.Option<number>>;
        canEdit: boolean;
        editTooltip: string;
        cannotEditTooltip: string;
        loading: boolean;
        confirmText: string;
    }

    export interface MoneyRow {
        label: string;
        amount: number;
        format?: string;
        total?: boolean;
    }

    export interface Toggle {
        id: string;
        label: string;
        value: boolean;
        disabled?: boolean;
    }

    export interface ToggleChange {
        id: string;
        value: boolean;
    }

    export interface Transition {
        options: ReadonlyArray<IRtSelect.Option<string>>;
        loading: boolean;
        error: string | null;
        submitting: boolean;
        submitError: string | null;
        success: string | null;
        currentStageLabel: string | null;
        noTransitionsText: string;
    }

    export interface TransitionSubmit {
        stageKey: string;
        comment: string;
    }

    export interface Audit {
        steps: readonly IRtTimeline.Step[];
        loading: boolean;
        loadingMore: boolean;
        hasMore: boolean;
        error: string | null;
        emptyText: string;
    }

    export interface ActionConfirm {
        title: string;
        label: string;
        tone: IRtConfirmPopover.Tone;
        text: string;
    }

    export interface Action {
        id: string;
        label: string;
        icon: string;
        theme?: IButton.Theme;
        appearance?: IButton.Appearance;
        loading?: boolean;
        disabled?: boolean;
        confirm?: ActionConfirm;
    }
}
