import { ModelStatus } from '../enums';
import { IStateBase } from '../interfaces';

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
