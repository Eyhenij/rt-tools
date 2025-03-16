import { inject, Injectable } from '@angular/core';
import { Observable, Observer, Subscriber } from 'rxjs';

import { WINDOW } from '../util';
import { IIDBStorageServiceInterface } from './interfaces/idb-storage-service.interface';

@Injectable()
export class IDBStorageService<ENTITY_TYPE> implements IIDBStorageServiceInterface<ENTITY_TYPE> {
    readonly #windowRef: Window = inject(WINDOW);

    #context: Observable<IDBDatabase>;

    constructor() {
        this.#context = new Observable<IDBDatabase>((observer: Observer<IDBDatabase>) => {
            if ('indexedDB' in this.#windowRef && 'open' in this.#windowRef.indexedDB) {
                const openRequest: IDBOpenDBRequest = this.#windowRef.indexedDB.open('use-idb', 1);
                openRequest.onerror = (): void => observer.error(openRequest.error);
                openRequest.onsuccess = (): void => observer.next(openRequest.result);
                openRequest.onupgradeneeded = (): IDBObjectStore => openRequest.result.createObjectStore('idb');
            } else {
                observer.error('IndexedDB not supported');
            }
        });
    }

    public get(key: string): Observable<ENTITY_TYPE | undefined> {
        return new Observable<ENTITY_TYPE | undefined>((observer: Subscriber<ENTITY_TYPE | undefined>) => {
            this.#context.subscribe((db: IDBDatabase) => {
                const transaction: IDBTransaction = db.transaction('idb', 'readonly');
                const store: IDBObjectStore = transaction.objectStore('idb');
                const request: IDBRequest<ENTITY_TYPE> = store.get(key);

                request.onsuccess = (): void => observer.next(request.result);
                request.onerror = (): void => observer.error(request.error);
            });
        });
    }

    public set(key: string, value: ENTITY_TYPE): Observable<void> {
        return new Observable<void>((observer: Subscriber<void>) => {
            this.#context.subscribe((db: IDBDatabase) => {
                const transaction: IDBTransaction = db.transaction('idb', 'readwrite');
                const store: IDBObjectStore = transaction.objectStore('idb');
                const request: IDBRequest<IDBValidKey> = store.put(value, key);

                request.onsuccess = (): void => observer.next();
                request.onerror = (): void => observer.error(request.error);
            });
        });
    }

    public remove(key: string): Observable<void> {
        return new Observable<void>((observer: Subscriber<void>) => {
            this.#context.subscribe((db: IDBDatabase) => {
                const transaction: IDBTransaction = db.transaction('idb', 'readwrite');
                const store: IDBObjectStore = transaction.objectStore('idb');
                const request: IDBRequest<undefined> = store.delete(key);

                request.onsuccess = (): void => observer.next();
                request.onerror = (): void => observer.error(request.error);
            });
        });
    }
}
