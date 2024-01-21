import { Nullable, Primitive } from '../../interfaces';
import { ModelStatus } from '../enums/async-state-status.enum';


export namespace IStateBase {
    export interface Async {
        /** @description Indicates status of the first request for getting list of Entities */
        loading: boolean;
        /** @description Indicates status of the following requests for getting list of Entities */
        fetching: boolean;
        /** @description Indicates status of all the requests for getting list of Entities */
        pending: boolean;

        requestStatus: ModelStatus;
        loadingStatus: ModelStatus;
        fetchingStatus: ModelStatus;
        /** @description Indicates statuses of create/update requests */
        upsertStatus: ModelStatus;
        /** @description Indicates statuses of delete requests */
        deleteStatus: ModelStatus;
    }

    export interface List<
        ENTITY_TYPE extends object,
        PAGE_MODEL_TYPE extends object,
        SORT_MODEL_TYPE extends object,
    > extends Async {
        entities: ENTITY_TYPE[];
        pageModel: PAGE_MODEL_TYPE;
        sortModel: Nullable<SORT_MODEL_TYPE>;
        searchTerm: Nullable<string>;
        params: { [key: string]: Primitive };
    }
}
