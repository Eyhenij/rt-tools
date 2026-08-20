import { computed, Signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { isNil } from '@rt-tools/utils';

import { BaseStoreService } from './base-store.service';
import { BASE_INITIAL_STATE } from './constants/base-initial-state.const';
import { EModelStatus } from './enums/async-state-status.enum';
import { IBaseAsyncStoreService, ISetPropertiesConfig } from './interfaces/async-store-service.interface';
import { IStoreConfig } from './interfaces/devtools.interface';
import { IStateBase } from './interfaces/state-base.interface';

/**
 * @description Base async store.
 * The failure methods carry whatever the transport reports as an error: the store never inspects it,
 * so `ERROR_TYPE` defaults to `unknown` and consumers on any transport can narrow it themselves.
 */
export abstract class BaseAsyncStoreService<STATE_TYPE extends IStateBase.Async, MSG_TYPE extends string, ERROR_TYPE = unknown>
    extends BaseStoreService<STATE_TYPE, MSG_TYPE>
    implements IBaseAsyncStoreService<STATE_TYPE, MSG_TYPE, ERROR_TYPE>
{
    // ================================
    // Selectors
    // ================================

    /**
     * Selectors answer with the type they declare even when the field is missing from the state.
     *
     * A descendant builds the state object itself, so a flag may simply not be there. Read as
     * `undefined`, a waiting flag looks like "not waiting" and the screen shows an empty list
     * instead of a spinner; neither the build nor the linter sees it — the type promises a value.
     *
     * The fallback is chosen by emptiness, not by truthiness: `EModelStatus.Init` is the first
     * member of the enum, and `||` cannot tell it from a missing field.
     */
    public readonly loading: Signal<boolean> = computed(() => this.store().loading ?? false);
    public readonly fetching: Signal<boolean> = computed(() => this.store().fetching ?? false);
    public readonly pending: Signal<boolean> = computed(() => this.loading() || this.fetching());
    public readonly requestStatus: Signal<EModelStatus> = computed(() => this.store().requestStatus ?? EModelStatus.Init);
    public readonly loadingStatus: Signal<EModelStatus> = computed(() => this.store().loadingStatus ?? EModelStatus.Init);
    public readonly fetchingStatus: Signal<EModelStatus> = computed(() => this.store().fetchingStatus ?? EModelStatus.Init);
    public readonly upsertStatus: Signal<EModelStatus> = computed(() => this.store().upsertStatus ?? EModelStatus.Init);
    public readonly deleteStatus: Signal<EModelStatus> = computed(() => this.store().deleteStatus ?? EModelStatus.Init);

    protected constructor(initialState: STATE_TYPE, config?: IStoreConfig) {
        super(initialState, config);
    }

    // ================================
    // Actions
    // ================================

    /**
     * A failure equal to `0` or to an empty string is a failure all the same: judged by
     * truthiness, it was dropped together with the callback that was supposed to follow it.
     */
    public handleError(error?: ERROR_TYPE, callbackFn?: () => void): void {
        if (!isNil(error)) {
            // eslint-disable-next-line no-console
            console.error(error);

            if (callbackFn) {
                callbackFn();
            }
        }
    }

    public resetAsyncState(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                ...BASE_INITIAL_STATE.ASYNC,
            }),
            'resetAsyncState'
        );
    }

    // ================================
    // region Load Actions
    // ================================

    public startLoading(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: true,
                requestStatus: EModelStatus.Pending,
                loadingStatus: EModelStatus.Pending,
            }),
            'startLoading'
        );
    }

    public setLoadingSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: EModelStatus.Success,
                loadingStatus: EModelStatus.Success,
            }),
            'setLoadingSuccess'
        );
    }

    public setLoadingFailure(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: EModelStatus.Error,
                loadingStatus: EModelStatus.Error,
            }),
            'setLoadingFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setLoadingFailureVoid(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: EModelStatus.Error,
                loadingStatus: EModelStatus.Error,
            }),
            'setLoadingFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
    }

    // endregion

    // ================================
    // region Fetch Actions
    // ================================

    public startFetching(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                fetching: true,
                requestStatus: EModelStatus.Pending,
                fetchingStatus: EModelStatus.Pending,
            }),
            'startFetching'
        );
    }

    public setFetchingSuccess(): void {
        this.patchState(
            (store: STATE_TYPE): STATE_TYPE => ({
                ...store,
                fetching: false,
                requestStatus: EModelStatus.Success,
                fetchingStatus: EModelStatus.Success,
            }),
            'setFetchingSuccess'
        );
    }

    public setFetchingFailure(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                fetching: false,
                requestStatus: EModelStatus.Error,
                fetchingStatus: EModelStatus.Error,
            }),
            'setFetchingFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setFetchingFailureVoid(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                fetching: false,
                requestStatus: EModelStatus.Error,
                fetchingStatus: EModelStatus.Error,
            }),
            'setFetchingFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
    }

    // endregion

    // ================================
    // region Upsert Actions
    // ================================

    public resetUpsertStatus(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Init,
                upsertStatus: EModelStatus.Init,
            }),
            'resetUpsertStatus'
        );
    }

    public startUpsert(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Pending,
                upsertStatus: EModelStatus.Pending,
            }),
            'startUpsert'
        );
    }

    public setUpsertSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Success,
                upsertStatus: EModelStatus.Success,
            }),
            'setUpsertSuccess'
        );
    }

    public setUpsertFailure(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Error,
                upsertStatus: EModelStatus.Error,
            }),
            'setUpsertFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setUpsertFailureVoid(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Error,
                upsertStatus: EModelStatus.Error,
            }),
            'setUpsertFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
    }

    // endregion

    // ================================
    // region Delete Actions
    // ================================

    public resetDeleteStatus(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Init,
                deleteStatus: EModelStatus.Init,
            }),
            'resetDeleteStatus'
        );
    }

    public startDelete(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Pending,
                deleteStatus: EModelStatus.Pending,
            }),
            'startDelete'
        );
    }

    public setDeleteSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Success,
                deleteStatus: EModelStatus.Success,
            }),
            'setDeleteSuccess'
        );
    }

    public setDeleteFailure(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Error,
                deleteStatus: EModelStatus.Error,
            }),
            'setDeleteFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setDeleteFailureVoid(error: ERROR_TYPE, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: EModelStatus.Error,
                deleteStatus: EModelStatus.Error,
            }),
            'setDeleteFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
    }

    // endregion
}
