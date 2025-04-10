import { IAction } from './action.interface';
import { Observable } from 'rxjs';
import { Signal } from '@angular/core';

export interface IBaseStoreService<STATE_TYPE extends object, MSG_TYPE extends string> {
    store: Signal<STATE_TYPE>;
    dispatch: (event: IAction<MSG_TYPE>) => void;
    onDispatch: (msg: MSG_TYPE) => Observable<IAction<MSG_TYPE>>;
    patchState: (callbackFn: (state: STATE_TYPE) => STATE_TYPE) => void;
}
