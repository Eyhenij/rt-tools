import { ComponentFixture, TestBed } from '@angular/core/testing';

import { classesOf, createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtActionBarHolderComponent } from './rt-action-bar-holder.component';
import { RT_ACTION_BAR_LEAVE_MS } from './rt-action-bar.model';
import { RtActionBarService } from './rt-action-bar.service';

function setup(): ComponentFixture<RtActionBarHolderComponent> {
    return createRtFixture(RtActionBarHolderComponent, {}, { providers: [RtActionBarService] });
}

function service(): RtActionBarService {
    return TestBed.inject(RtActionBarService);
}

/**
 * Крючок, которым держатель начинает уход, сам по себе не заводится: кит поднят без зоны, и
 * `detectChanges` его не догоняет. Отсюда `TestBed.tick()` после каждой перемены настройки.
 */
function settle(fixture: ComponentFixture<RtActionBarHolderComponent>): void {
    TestBed.tick();
    fixture.detectChanges();
}

describe('RtActionBarHolderComponent', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-200 — ничего не выбрано: полосы в разметке нет вовсе', (): void => {
        expect(qa(setup(), 'action-bar-holder-bar')).toBeNull();
    });

    it('SC-UKV-199 — полоса появляется, как только что-то выбрали', (): void => {
        const fixture: ComponentFixture<RtActionBarHolderComponent> = setup();

        service().setCounts(1, 128);
        settle(fixture);

        expect(qa(fixture, 'action-bar-holder-bar')).not.toBeNull();
    });

    it('SC-UKV-206 — полоса держится в разметке, пока идёт уход, и снимается по его концу', (): void => {
        const fixture: ComponentFixture<RtActionBarHolderComponent> = setup();

        service().setCounts(3, 128);
        settle(fixture);
        service().clearSelection();
        settle(fixture);

        // Уход начался: полоса на месте и несёт признак ухода.
        expect(classesOf(qa(fixture, 'action-bar-holder-bar'))).toContain('rt-action-bar-holder__bar--leaving');

        jest.advanceTimersByTime(RT_ACTION_BAR_LEAVE_MS);
        settle(fixture);

        expect(qa(fixture, 'action-bar-holder-bar')).toBeNull();
    });

    it('выбранное, вернувшееся посреди ухода, отменяет его', (): void => {
        const fixture: ComponentFixture<RtActionBarHolderComponent> = setup();

        service().setCounts(3, 128);
        settle(fixture);
        service().clearSelection();
        settle(fixture);
        service().setCounts(1, 128);
        settle(fixture);

        jest.advanceTimersByTime(RT_ACTION_BAR_LEAVE_MS);
        settle(fixture);

        expect(classesOf(qa(fixture, 'action-bar-holder-bar'))).not.toContain('rt-action-bar-holder__bar--leaving');
        expect(qa(fixture, 'action-bar-holder-bar')).not.toBeNull();
    });

    it('крестик отпускает выбранное через службу, а не внутри полосы', (): void => {
        const fixture: ComponentFixture<RtActionBarHolderComponent> = setup();

        service().setActions([{ label: 'Скачать' }]);
        service().setCounts(3, 128);
        settle(fixture);
        qa(fixture, 'action-bar-close')?.nativeElement.querySelector('button').click();
        settle(fixture);

        expect(service().config().selected).toBe(0);
        expect(service().config().actions.length).toBe(1);
    });
});
