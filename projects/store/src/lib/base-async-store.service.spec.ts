import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { BaseAsyncStoreService } from './base-async-store.service';
import { BASE_INITIAL_STATE } from './constants/base-initial-state.const';
import { ModelStatus } from './enums/async-state-status.enum';
import { IStateBase } from './interfaces/state-base.interface';

interface ITestState extends IStateBase.Async {
    value: string;
}

type TestMsg = 'LOAD';

const INITIAL_STATE: ITestState = { ...BASE_INITIAL_STATE.ASYNC, value: '' };

/** @description Consumer that never declares an error type — the failure argument stays `unknown`. */
@Injectable()
class DefaultErrorStore extends BaseAsyncStoreService<ITestState, TestMsg> {
    constructor() {
        super(INITIAL_STATE, { name: 'DefaultErrorStore' });
    }
}

/** @description Failure shape of a transport that reports neither an `Error` nor an HTTP response. */
interface ITransportFailure {
    code: number;
    reason: string;
}

/** @description Consumer on a non-HTTP transport declaring its own failure type. */
@Injectable()
class TransportErrorStore extends BaseAsyncStoreService<ITestState, TestMsg, ITransportFailure> {
    constructor() {
        super(INITIAL_STATE, { name: 'TransportErrorStore' });
    }
}

describe('BaseAsyncStoreService', () => {
    let store: DefaultErrorStore;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DefaultErrorStore, TransportErrorStore],
        });
        store = TestBed.inject(DefaultErrorStore);
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('handleError', () => {
        it('logs the failure and invokes the callback', () => {
            const callbackFn: jest.Mock<void, []> = jest.fn();
            const error: ITransportFailure = { code: 7, reason: 'transport closed' };

            store.handleError(error, callbackFn);

            expect(consoleErrorSpy).toHaveBeenCalledWith(error);
            expect(callbackFn).toHaveBeenCalledTimes(1);
        });

        it('does nothing without a failure', () => {
            const callbackFn: jest.Mock<void, []> = jest.fn();

            store.handleError(undefined, callbackFn);

            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(callbackFn).not.toHaveBeenCalled();
        });
    });

    describe('failure statuses', () => {
        it('marks loading as failed and rethrows the untouched failure', (done: jest.DoneCallback) => {
            const error: ITransportFailure = { code: 14, reason: 'unavailable' };
            const result$: Observable<never> = store.setLoadingFailure(error);

            expect(store.loading()).toBe(false);
            expect(store.loadingStatus()).toBe(ModelStatus.Error);
            expect(store.requestStatus()).toBe(ModelStatus.Error);

            result$.subscribe({
                error: (thrown: unknown): void => {
                    expect(thrown).toBe(error);
                    done();
                },
            });
        });

        it('honours showNotification: false', () => {
            store.setLoadingFailureVoid({ code: 1, reason: 'aborted' }, { showNotification: false });

            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(store.loadingStatus()).toBe(ModelStatus.Error);
        });

        it('marks fetching as failed', () => {
            store.setFetchingFailureVoid({ code: 2, reason: 'timeout' });

            expect(store.fetching()).toBe(false);
            expect(store.fetchingStatus()).toBe(ModelStatus.Error);
        });

        it('marks upsert as failed', () => {
            store.setUpsertFailureVoid({ code: 3, reason: 'rejected' });

            expect(store.upsertStatus()).toBe(ModelStatus.Error);
        });

        it('marks delete as failed', () => {
            store.setDeleteFailureVoid({ code: 4, reason: 'conflict' });

            expect(store.deleteStatus()).toBe(ModelStatus.Error);
        });
    });

    describe('transport-specific error type', () => {
        it('passes the declared failure shape through to handleError', () => {
            const transportStore: TransportErrorStore = TestBed.inject(TransportErrorStore);
            const error: ITransportFailure = { code: 13, reason: 'stream reset' };

            transportStore.setUpsertFailureVoid(error);

            expect(consoleErrorSpy).toHaveBeenCalledWith(error);
            expect(transportStore.upsertStatus()).toBe(ModelStatus.Error);
        });

        it('reports the declared shape as the handleError argument type', () => {
            const transportStore: TransportErrorStore = TestBed.inject(TransportErrorStore);

            transportStore.handleError({ code: 5, reason: 'closed' }, (): void => undefined);

            // @ts-expect-error the store declares ITransportFailure, so an HTTP-shaped failure is rejected
            transportStore.handleError({ status: 500, statusText: 'Server Error' });

            expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('resetAsyncState', () => {
        it('returns every async flag to its initial value', () => {
            store.startLoading();
            store.setUpsertFailureVoid({ code: 6, reason: 'nope' }, { showNotification: false });

            store.resetAsyncState();

            expect(store.loading()).toBe(false);
            expect(store.requestStatus()).toBe(ModelStatus.Init);
            expect(store.upsertStatus()).toBe(ModelStatus.Init);
        });
    });
});
