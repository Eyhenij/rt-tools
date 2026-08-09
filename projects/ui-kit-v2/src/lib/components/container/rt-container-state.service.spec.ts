import { TestBed } from '@angular/core/testing';

import { RtContainerStateService } from './rt-container-state.service';

describe('RtContainerStateService', (): void => {
    it('левая панель по умолчанию раскрыта', (): void => {
        expect(new RtContainerStateService().leftSidenavOpen()).toBe(true);
    });

    it('состояние живёт у своего каркаса, а не одно на все', (): void => {
        // Служба объявляется провайдером самого каркаса: с общим экземпляром
        // сворачивание панели в одном окне сворачивало бы её во всех.
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ providers: [RtContainerStateService] });

        const first: RtContainerStateService = TestBed.inject(RtContainerStateService);
        const second: RtContainerStateService = new RtContainerStateService();

        first.leftSidenavOpen.set(false);

        expect(first.leftSidenavOpen()).toBe(false);
        expect(second.leftSidenavOpen()).toBe(true);
    });
});
