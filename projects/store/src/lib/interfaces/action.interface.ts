import { MessageBusEvent } from '@rt-tools/core';

export interface IAction<T = string> extends MessageBusEvent<T> {
    readonly payload?: unknown;
}
