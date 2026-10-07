import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';

import { Code, ConnectError, ConnectRouter, createRouterTransport, ServiceImpl } from '@connectrpc/connect';
import { CmsService } from '@rt-tools/cms-contract';
import { CMS_TRANSPORT } from '@rt-tools/cms-angular';
import { INotification, NotificationBus } from '@rt-tools/ui-kit-v2';

/** The CMS server of a test: only the procedures the test answers; a call to any other fails the test. */
export type TCmsServerDouble = Partial<ServiceImpl<typeof CmsService>>;

/** What the test reads back: the messages the stores showed to the person. */
export interface ICmsTestBed {
    readonly notices: INotification.Event[];
}

/** Raises the test bed with the CMS client calling the given server double over an in-memory transport. */
export function cmsTestBed(server: TCmsServerDouble, providers: unknown[] = []): ICmsTestBed {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [
            {
                provide: CMS_TRANSPORT,
                useValue: createRouterTransport((router: ConnectRouter) => {
                    router.service(CmsService, server);
                }),
            },
            ...(providers as never[]),
        ],
    });
    const notices: INotification.Event[] = [];
    TestBed.inject(NotificationBus)
        .onEmit()
        .pipe(takeUntilDestroyed(TestBed.inject(DestroyRef)))
        .subscribe((event: INotification.Event) => notices.push(event));
    const bed: ICmsTestBed = { notices };
    return bed;
}

/** A refusal of the server with a code. */
export function refusal(code: Code): ConnectError {
    return new ConnectError('refused', code);
}

/** Lets the answers of the in-memory server arrive. */
export async function settled(): Promise<void> {
    await new Promise<void>((resolve: () => void) => {
        setTimeout(resolve, 0);
    });
}
