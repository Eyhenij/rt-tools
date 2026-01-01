import { HttpErrorResponse } from '@angular/common/http';
import { computed, Signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { BaseStoreService } from './base-store.service';
import { BASE_INITIAL_STATE } from './constants/base-initial-state.const';
import { ModelStatus } from './enums/async-state-status.enum';
import { IBaseAsyncStoreService, ISetPropertiesConfig } from './interfaces/async-store-service.interface';
import { IStoreConfig } from './interfaces/devtools.interface';
import { IStateBase } from './interfaces/state-base.interface';

export abstract class BaseAsyncStoreService<STATE_TYPE extends IStateBase.Async, MSG_TYPE extends string>
    extends BaseStoreService<STATE_TYPE, MSG_TYPE>
    implements IBaseAsyncStoreService<STATE_TYPE, MSG_TYPE>
{
    // ================================
    // Selectors
    // ================================

    public readonly loading: Signal<boolean> = computed(() => this.store().loading);
    public readonly fetching: Signal<boolean> = computed(() => this.store().fetching);
    public readonly pending: Signal<boolean> = computed(() => this.loading() || this.fetching());
    public readonly requestStatus: Signal<ModelStatus> = computed(() => this.store().requestStatus || ModelStatus.Init);
    public readonly loadingStatus: Signal<ModelStatus> = computed(() => this.store().loadingStatus || ModelStatus.Init);
    public readonly fetchingStatus: Signal<ModelStatus> = computed(() => this.store().fetchingStatus || ModelStatus.Init);
    public readonly upsertStatus: Signal<ModelStatus> = computed(() => this.store().upsertStatus || ModelStatus.Init);
    public readonly deleteStatus: Signal<ModelStatus> = computed(() => this.store().deleteStatus || ModelStatus.Init);

    protected constructor(initialState: STATE_TYPE, config?: IStoreConfig) {
        super(initialState, config);
    }

    // ================================
    // Actions
    // ================================

    public handleError(error?: HttpErrorResponse, callbackFn?: () => void): void {
        if (error) {
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
                requestStatus: ModelStatus.Pending,
                loadingStatus: ModelStatus.Pending,
            }),
            'startLoading'
        );
    }

    public setLoadingSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: ModelStatus.Success,
                loadingStatus: ModelStatus.Success,
            }),
            'setLoadingSuccess'
        );
    }

    public setLoadingFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: ModelStatus.Error,
                loadingStatus: ModelStatus.Error,
            }),
            'setLoadingFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setLoadingFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: ModelStatus.Error,
                loadingStatus: ModelStatus.Error,
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
                requestStatus: ModelStatus.Pending,
                fetchingStatus: ModelStatus.Pending,
            }),
            'startFetching'
        );
    }

    public setFetchingSuccess(): void {
        this.patchState(
            (store: STATE_TYPE): STATE_TYPE => ({
                ...store,
                fetching: false,
                requestStatus: ModelStatus.Success,
                fetchingStatus: ModelStatus.Success,
            }),
            'setFetchingSuccess'
        );
    }

    public setFetchingFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                fetching: false,
                requestStatus: ModelStatus.Error,
                fetchingStatus: ModelStatus.Error,
            }),
            'setFetchingFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setFetchingFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                fetching: false,
                requestStatus: ModelStatus.Error,
                fetchingStatus: ModelStatus.Error,
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
                requestStatus: ModelStatus.Init,
                upsertStatus: ModelStatus.Init,
            }),
            'resetUpsertStatus'
        );
    }

    public startUpsert(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Pending,
                upsertStatus: ModelStatus.Pending,
            }),
            'startUpsert'
        );
    }

    public setUpsertSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Success,
                upsertStatus: ModelStatus.Success,
            }),
            'setUpsertSuccess'
        );
    }

    public setUpsertFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Error,
                upsertStatus: ModelStatus.Error,
            }),
            'setUpsertFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setUpsertFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Error,
                upsertStatus: ModelStatus.Error,
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
                requestStatus: ModelStatus.Init,
                deleteStatus: ModelStatus.Init,
            }),
            'resetDeleteStatus'
        );
    }

    public startDelete(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Pending,
                deleteStatus: ModelStatus.Pending,
            }),
            'startDelete'
        );
    }

    public setDeleteSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Success,
                deleteStatus: ModelStatus.Success,
            }),
            'setDeleteSuccess'
        );
    }

    public setDeleteFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Error,
                deleteStatus: ModelStatus.Error,
            }),
            'setDeleteFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
        return throwError(() => error);
    }

    public setDeleteFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Error,
                deleteStatus: ModelStatus.Error,
            }),
            'setDeleteFailure'
        );

        if (config.showNotification) {
            this.handleError(error);
        }
    }

    // endregion
}
