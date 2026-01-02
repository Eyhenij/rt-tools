import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BaseStoreService } from './base-store.service';
import { DevToolsManagerService } from './services/devtools-manager.service';
import { provideStoreDevTools } from './tokens/devtools.token';

interface ITestState {
    count: number;
    name: string;
}

type TestMsg = 'INCREMENT' | 'DECREMENT' | 'SET_NAME';

@Injectable()
class TestStore extends BaseStoreService<ITestState, TestMsg> {
    constructor() {
        super({ count: 0, name: '' }, { name: 'TestStore' });
    }

    public increment(): void {
        this.patchState((state: ITestState) => ({ ...state, count: state.count + 1 }), 'increment');
    }

    public decrement(): void {
        this.patchState((state: ITestState) => ({ ...state, count: state.count - 1 }), 'decrement');
    }

    public setName(name: string): void {
        this.patchState((state: ITestState) => ({ ...state, name }), 'setName');
    }
}

@Injectable()
class AnotherTestStore extends BaseStoreService<{ value: string }, 'UPDATE'> {
    constructor() {
        super({ value: 'initial' }, { name: 'AnotherStore' });
    }

    public updateValue(value: string): void {
        this.patchState((state: { value: string }) => ({ ...state, value }), 'updateValue');
    }
}

describe('BaseStoreService', () => {
    describe('without DevTools', () => {
        let store: TestStore;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TestStore],
            });
            store = TestBed.inject(TestStore);
        });

        it('should create store with initial state', () => {
            expect(store.store()).toEqual({ count: 0, name: '' });
        });

        it('should update state via patchState', () => {
            store.increment();
            expect(store.store().count).toBe(1);

            store.increment();
            expect(store.store().count).toBe(2);

            store.decrement();
            expect(store.store().count).toBe(1);
        });

        it('should update multiple properties', () => {
            store.increment();
            store.setName('test');

            expect(store.store()).toEqual({ count: 1, name: 'test' });
        });

        it('should work without DevToolsManagerService', () => {
            // DevToolsManagerService should not be injected when provideStoreDevTools is not called
            let devToolsManager: DevToolsManagerService | null = null;
            try {
                devToolsManager = TestBed.inject(DevToolsManagerService);
            } catch {
                // Expected - service is not provided
            }
            expect(devToolsManager).toBeNull();
        });
    });

    describe('with DevTools enabled', () => {
        let store: TestStore;
        let devToolsManager: DevToolsManagerService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [provideStoreDevTools({ enabled: true, name: 'Test App' }), TestStore],
            });
            store = TestBed.inject(TestStore);
            devToolsManager = TestBed.inject(DevToolsManagerService);
        });

        it('should inject DevToolsManagerService when provideStoreDevTools is called', () => {
            expect(devToolsManager).toBeTruthy();
        });

        it('should create store with initial state', () => {
            expect(store.store()).toEqual({ count: 0, name: '' });
        });

        it('should update state via patchState', () => {
            store.increment();
            expect(store.store().count).toBe(1);
        });
    });

    describe('multiple stores with DevTools', () => {
        let testStore: TestStore;
        let anotherStore: AnotherTestStore;
        let devToolsManager: DevToolsManagerService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [provideStoreDevTools({ enabled: true, name: 'Multi Store Test' }), TestStore, AnotherTestStore],
            });
            testStore = TestBed.inject(TestStore);
            anotherStore = TestBed.inject(AnotherTestStore);
            devToolsManager = TestBed.inject(DevToolsManagerService);
        });

        it('should have single DevToolsManagerService instance', () => {
            expect(devToolsManager).toBeTruthy();
        });

        it('should manage multiple stores independently', () => {
            testStore.increment();
            anotherStore.updateValue('updated');

            expect(testStore.store().count).toBe(1);
            expect(anotherStore.store().value).toBe('updated');
        });

        it('should allow both stores to update without conflicts', () => {
            testStore.increment();
            testStore.increment();
            anotherStore.updateValue('first');
            testStore.decrement();
            anotherStore.updateValue('second');

            expect(testStore.store().count).toBe(1);
            expect(anotherStore.store().value).toBe('second');
        });
    });

    describe('DevToolsManagerService singleton verification', () => {
        it('should use the same DevToolsManagerService instance for all stores', () => {
            TestBed.configureTestingModule({
                providers: [provideStoreDevTools({ enabled: true, name: 'Singleton Test' }), TestStore, AnotherTestStore],
            });

            const devToolsManager1: DevToolsManagerService = TestBed.inject(DevToolsManagerService);
            const devToolsManager2: DevToolsManagerService = TestBed.inject(DevToolsManagerService);

            // Both injections should return the same instance
            expect(devToolsManager1).toBe(devToolsManager2);

            // Create stores and verify they work
            const store1: TestStore = TestBed.inject(TestStore);
            const store2: AnotherTestStore = TestBed.inject(AnotherTestStore);

            store1.increment();
            store2.updateValue('test');

            expect(store1.store().count).toBe(1);
            expect(store2.store().value).toBe('test');
        });
    });

    describe('dispatch and message bus', () => {
        let store: TestStore;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TestStore],
            });
            store = TestBed.inject(TestStore);
        });

        it('should emit events via dispatch', (done: jest.DoneCallback) => {
            store.onDispatch('INCREMENT').subscribe((action: { type: TestMsg; payload?: unknown }) => {
                expect(action.type).toBe('INCREMENT');
                expect(action.payload).toBe(5);
                done();
            });

            store.dispatch({ type: 'INCREMENT', payload: 5 });
        });

        it('should filter events by type', (done: jest.DoneCallback) => {
            const receivedTypes: string[] = [];

            store.onDispatch('SET_NAME').subscribe((action: { type: TestMsg; payload?: unknown }) => {
                receivedTypes.push(action.type);
                expect(action.type).toBe('SET_NAME');
                done();
            });

            store.dispatch({ type: 'INCREMENT', payload: 1 });
            store.dispatch({ type: 'SET_NAME', payload: 'test' });
        });
    });
});
