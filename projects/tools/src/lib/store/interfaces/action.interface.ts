import { MessageBusEvent } from '../../util/services/message-bus';

export interface IAction<T = string> extends MessageBusEvent<T> {
    readonly payload?: unknown;
}
