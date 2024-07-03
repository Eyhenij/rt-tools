import { HttpErrorResponse } from '@angular/common/http';
import { Signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ModelStatus } from '../enums/async-state-status.enum';

export interface ISetPropertiesConfig {
    showNotification?: boolean;
}

export interface IBaseAsyncStoreService {
    // ================================
    // region Selectors
    // ================================

    /** @description Indicates status of the first request for getting list of Entities */
    loading: Signal<boolean>;
    /** @description Indicates status of the following requests for getting list of Entities */
    fetching: Signal<boolean>;
    /** @description Indicates status of all the requests for getting list of Entities */
    pending: Signal<boolean>;

    /** @description Indicates failure status of the first request for getting list of Entities */
    requestStatus: Signal<ModelStatus>;
    /** @description Indicates statuses of create/update requests */
    upsertStatus: Signal<ModelStatus>;
    /** @description Indicates statuses of delete requests */
    deleteStatus: Signal<ModelStatus>;
    // endregion

    // ================================
    // region Actions
    // ================================

    handleError(error: HttpErrorResponse): void;
    /**
     * @description Resets the next props to initial values:
     * - loading,
     * - fetching,
     * - upsertStatus,
     * - deleteStatus,
     * - requestStatus
     */
    resetAsyncState(): void;
    // endregion

    // ================================
    // region Load Actions
    // ================================

    startLoading(): void;
    setLoadingSuccess(): void;
    setLoadingFailure(error: HttpErrorResponse, config: ISetPropertiesConfig): Observable<never>;
    setLoadingFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig): void;
    // endregion

    // ================================
    // region Fetch Actions
    // ================================

    startFetching(): void;
    setFetchingSuccess(): void;
    setFetchingFailure(error: HttpErrorResponse, config: ISetPropertiesConfig): Observable<never>;
    setFetchingFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig): void;
    // endregion

    // ================================
    // region Upsert Actions
    // ================================

    /** @description Resets status for create/update requests */
    resetUpsertStatus(): void;
    startUpsert(): void;
    setUpsertSuccess(): void;
    setUpsertFailure(error: HttpErrorResponse, config: ISetPropertiesConfig): Observable<never>;
    setUpsertFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig): void;
    // endregion

    // ================================
    // region Delete Actions
    // ================================

    /** @description Resets status for delete requests */
    resetDeleteStatus(): void;
    startDelete(): void;
    setDeleteSuccess(): void;
    setDeleteFailure(error: HttpErrorResponse, config: ISetPropertiesConfig): Observable<never>;
    setDeleteFailureVoid(error: HttpErrorResponse, config: ISetPropertiesConfig): void;
    // endregion
}
