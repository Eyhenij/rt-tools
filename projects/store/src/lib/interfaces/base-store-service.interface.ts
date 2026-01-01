import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { IAction } from './action.interface';

export interface IBaseStoreService<STATE_TYPE extends object, MSG_TYPE extends string> {
    store: Signal<STATE_TYPE>;
    dispatch: (event: IAction<MSG_TYPE>) => void;
    onDispatch: (msg: MSG_TYPE) => Observable<IAction<MSG_TYPE>>;
    patchState: (callbackFn: (state: STATE_TYPE) => STATE_TYPE, actionName?: string) => void;
}
