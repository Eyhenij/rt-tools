import { HttpErrorResponse } from '@angular/common/http';
import { Signal, computed } from '@angular/core';

import { Observable, throwError } from 'rxjs';

import { BaseStoreService } from './base-store.service';
import { BASE_INITIAL_STATE } from './constants/base-initial-state.const';
import { ModelStatus } from './enums/async-state-status.enum';
import { IAction } from './interfaces/action.interface';
import { IBaseAsyncStoreService, ISetPropertiesConfig } from './interfaces/async-store-service.interface';
import { IStateBase } from './interfaces/state-base.interface';

export abstract class BaseAsyncStoreService<
        STATE_TYPE extends IStateBase.Async,
        MSG_TYPE extends string,
        ACTION_TYPE extends IAction<MSG_TYPE>,
    >
    extends BaseStoreService<STATE_TYPE, MSG_TYPE, ACTION_TYPE>
    implements IBaseAsyncStoreService
{
    // ================================
    // Selectors
    // ================================

    public readonly loading: Signal<boolean>;
    public readonly fetching: Signal<boolean>;
    public readonly pending: Signal<boolean>;
    public readonly requestStatus: Signal<ModelStatus>;
    public readonly loadingStatus: Signal<ModelStatus>;
    public readonly fetchingStatus: Signal<ModelStatus>;
    public readonly upsertStatus: Signal<ModelStatus>;
    public readonly deleteStatus: Signal<ModelStatus>;

    protected constructor() {
        super();
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                ...BASE_INITIAL_STATE.ASYNC,
            })
        );

        this.loading = computed(() => !!this.select('loading')());
        this.fetching = computed(() => !!this.select('fetching')());
        this.pending = computed<boolean>(() => this.loading() || this.fetching());
        this.requestStatus = computed(() => this.select('requestStatus')() || ModelStatus.Init);
        this.loadingStatus = computed(() => this.select('loadingStatus')() || ModelStatus.Init);
        this.fetchingStatus = computed(() => this.select('fetchingStatus')() || ModelStatus.Init);
        this.upsertStatus = computed(() => this.select('upsertStatus')() || ModelStatus.Init);
        this.deleteStatus = computed(() => this.select('deleteStatus')() || ModelStatus.Init);
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
            })
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
            })
        );
    }

    public setLoadingSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: ModelStatus.Success,
                loadingStatus: ModelStatus.Success,
            })
        );
    }

    public setLoadingFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                loading: false,
                requestStatus: ModelStatus.Error,
                loadingStatus: ModelStatus.Error,
            })
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
            })
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
            })
        );
    }

    public setFetchingSuccess(): void {
        this.patchState(
            (store: STATE_TYPE): STATE_TYPE => ({
                ...store,
                fetching: false,
                requestStatus: ModelStatus.Success,
                fetchingStatus: ModelStatus.Success,
            })
        );
    }

    public setFetchingFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                fetching: false,
                requestStatus: ModelStatus.Error,
                fetchingStatus: ModelStatus.Error,
            })
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
            })
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
            })
        );
    }

    public startUpsert(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Pending,
                upsertStatus: ModelStatus.Pending,
            })
        );
    }

    public setUpsertSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Success,
                upsertStatus: ModelStatus.Success,
            })
        );
    }

    public setUpsertFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Error,
                upsertStatus: ModelStatus.Error,
            })
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
            })
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
            })
        );
    }

    public startDelete(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Pending,
                deleteStatus: ModelStatus.Pending,
            })
        );
    }

    public setDeleteSuccess(): void {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Success,
                deleteStatus: ModelStatus.Success,
            })
        );
    }

    public setDeleteFailure(error: HttpErrorResponse, config: ISetPropertiesConfig = { showNotification: true }): Observable<never> {
        this.patchState(
            (state: STATE_TYPE): STATE_TYPE => ({
                ...state,
                requestStatus: ModelStatus.Error,
                deleteStatus: ModelStatus.Error,
            })
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
            })
        );

        if (config.showNotification) {
            this.handleError(error);
        }
    }

    // endregion
}
