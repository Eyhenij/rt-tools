import { EModelStatus } from '../enums';
import { IStateBase } from '../interfaces';

/**
 * The initial state declares exactly the fields the type declares.
 *
 * A field outside the type is invisible to descendants — `detailsStatus` sat here without ever
 * appearing in `IStateBase.Async` and without a single reader; a field outside this object stays
 * empty after `resetAsyncState`.
 */
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
    });
}
