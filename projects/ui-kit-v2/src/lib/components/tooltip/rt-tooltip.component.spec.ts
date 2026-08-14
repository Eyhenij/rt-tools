import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, renderedText } from '../../../testing/rt-kit-testing';
import { RtTooltipComponent } from './rt-tooltip.component';

function setup(): ComponentFixture<RtTooltipComponent> {
    return createRtFixture(RtTooltipComponent);
}

describe('RtTooltipComponent', (): void => {
    it('несёт свой блок и роль подсказки', (): void => {
        // Роль объявлена самой панелью: директива её не проставляет, а без роли
        // подсказку не прочитает ни один скринридер.
        const fixture: ComponentFixture<RtTooltipComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-tooltip');
        expect((fixture.nativeElement as HTMLElement).getAttribute('role')).toBe('tooltip');
    });

    it('до текста панель пуста', (): void => {
        expect(renderedText(setup())).toBe('');
    });

    it('текст ставится извне и перерисовывает панель', (): void => {
        // Панель создаётся директивой вручную, входа у неё нет вовсе: текст
        // кладут в сигнал, и без перерисовки по нему подсказка осталась бы пустой.
        const fixture: ComponentFixture<RtTooltipComponent> = setup();

        fixture.componentInstance.text.set('Скопировать номер');
        fixture.detectChanges();

        expect(renderedText(fixture)).toBe('Скопировать номер');
    });

    it('смена текста заменяет прежний, а не дописывает к нему', (): void => {
        const fixture: ComponentFixture<RtTooltipComponent> = setup();

        fixture.componentInstance.text.set('Скопировать номер');
        fixture.detectChanges();
        fixture.componentInstance.text.set('Скопировано');
        fixture.detectChanges();

        expect(renderedText(fixture)).toBe('Скопировано');
    });
});
