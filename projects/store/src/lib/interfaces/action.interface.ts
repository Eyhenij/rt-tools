import { IMessageBusEvent } from '@rt-tools/core';

export interface IAction<T = string> extends IMessageBusEvent<T> {
    readonly payload?: unknown;
}
