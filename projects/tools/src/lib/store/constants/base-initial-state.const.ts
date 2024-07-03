import { ModelStatus } from '../enums/async-state-status.enum';
import { IStateBase } from '../interfaces/state-base.interface';

export namespace BASE_INITIAL_STATE {
    export const ASYNC: Readonly<IStateBase.Async> = Object.freeze({
        loading: false,
        fetching: false,
        pending: false,

        requestStatus: ModelStatus.Init,
        loadingStatus: ModelStatus.Init,
        fetchingStatus: ModelStatus.Init,
        upsertStatus: ModelStatus.Init,
        deleteStatus: ModelStatus.Init,
        detailsStatus: ModelStatus.Init,
    });
}
