import { MessageBusEvent } from '../../services';


export interface IAction<T = string> extends MessageBusEvent<T> {
    readonly payload?: unknown;
}
