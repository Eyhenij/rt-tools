import { EModelStatus } from '../enums';
import { IStateBase } from '../interfaces';

export namespace BASE_INITIAL_STATE {
    export const ASYNC: Readonly<IStateBase.Async> = Object.freeze({
        loading: false,
        fetching: false,
        pending: false,

        requestStatus: EModelStatus.Init,
        loadingStatus: EModelStatus.Init,
        fetchingStatus: EModelStatus.Init,
        upsertStatus: EModelStatus.Init,
        deleteStatus: EModelStatus.Init,
        detailsStatus: EModelStatus.Init,
    });
}
