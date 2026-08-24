import { IDictionary, TPrimitive } from '@rt-tools/core';

import { EModelStatus } from '../enums';

export namespace IStateBase {
    export interface Async {
        /** @description Indicates status of the first request for getting list of Entities */
        loading: boolean;
        /** @description Indicates status of the following requests for getting list of Entities */
        fetching: boolean;
        /** @description Indicates status of all the requests for getting list of Entities */
        pending: boolean;

        requestStatus: EModelStatus;
        loadingStatus: EModelStatus;
        fetchingStatus: EModelStatus;
        /** @description Indicates statuses of create/update requests */
        upsertStatus: EModelStatus;
        /** @description Indicates statuses of delete requests */
        deleteStatus: EModelStatus;
    }

    export interface List<ENTITY_TYPE extends object, PAGE_MODEL_TYPE extends object, SORT_MODEL_TYPE extends object> extends Async {
        entities: ENTITY_TYPE[];
        pageModel: PAGE_MODEL_TYPE;
        /** @description Absence is spelled one way — the stores of this tree spell it `null`. */
        sortModel: SORT_MODEL_TYPE | null;
        searchTerm: string | null;
        params: IDictionary<TPrimitive>;
    }
}
