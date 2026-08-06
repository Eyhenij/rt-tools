import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses } from '../../../testing/rt-kit-testing';
import { IQuillDelta } from '../../util';
import { RtDeltaViewComponent } from './rt-delta-view.component';

function delta(ops: { insert: string; attributes?: Record<string, unknown> }[]): IQuillDelta {
    return { ops } as unknown as IQuillDelta;
}

function setup(value: IQuillDelta | null = null): ComponentFixture<RtDeltaViewComponent> {
    return createRtFixture(RtDeltaViewComponent, { delta: value });
}

function html(fixture: ComponentFixture<RtDeltaViewComponent>): string {
    return (fixture.nativeElement as HTMLElement).innerHTML;
}

describe('RtDeltaViewComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-delta-view');
    });

    it('без значения не рисует ничего', (): void => {
        expect(html(setup())).toBe('');
    });

    it('простой текст превращается в абзац', (): void => {
        const fixture: ComponentFixture<RtDeltaViewComponent> = setup(delta([{ insert: 'Привет\n' }]));

        expect(html(fixture)).toContain('<p>Привет</p>');
    });

    describe('начертания', (): void => {
        it.each<[string, string, string]>([
            ['жирный', 'bold', 'strong'],
            ['курсив', 'italic', 'em'],
            ['подчёркнутый', 'underline', 'u'],
            ['зачёркнутый', 'strike', 's'],
        ])('%s оборачивается в свой тег', (_name: string, attribute: string, tag: string): void => {
            const fixture: ComponentFixture<RtDeltaViewComponent> = setup(delta([{ insert: 'Важно', attributes: { [attribute]: true } }]));

            expect(html(fixture)).toContain(`<${tag}>Важно</${tag}>`);
        });

        it('несколько начертаний вкладываются друг в друга', (): void => {
            const fixture: ComponentFixture<RtDeltaViewComponent> = setup(
                delta([{ insert: 'Важно', attributes: { bold: true, italic: true } }])
            );

            expect(html(fixture)).toContain('<strong>Важно</strong>');
            expect(html(fixture)).toContain('<em>');
        });
    });

    describe('блоки', (): void => {
        it('соседние строки списка собираются в один список', (): void => {
            // Каждая строка приходит своей операцией: без склейки получился бы
            // список из одного пункта на каждую строку.
            const fixture: ComponentFixture<RtDeltaViewComponent> = setup(
                delta([
                    { insert: 'Первый' },
                    { insert: '\n', attributes: { list: 'bullet' } },
                    { insert: 'Второй' },
                    { insert: '\n', attributes: { list: 'bullet' } },
                ])
            );

            expect((fixture.nativeElement as HTMLElement).querySelectorAll('ul').length).toBe(1);
            expect((fixture.nativeElement as HTMLElement).querySelectorAll('li').length).toBe(2);
        });

        it('блок кода рисуется парой pre + code', (): void => {
            const fixture: ComponentFixture<RtDeltaViewComponent> = setup(
                delta([{ insert: 'npm i' }, { insert: '\n', attributes: { 'code-block': true } }])
            );

            expect((fixture.nativeElement as HTMLElement).querySelector('pre > code')).not.toBeNull();
        });
    });

    it('смена значения перерисовывает содержимое целиком', (): void => {
        const fixture: ComponentFixture<RtDeltaViewComponent> = setup(delta([{ insert: 'Старое\n' }]));

        fixture.componentRef.setInput('delta', delta([{ insert: 'Новое\n' }]));
        fixture.detectChanges();

        expect(html(fixture)).toContain('Новое');
        expect(html(fixture)).not.toContain('Старое');
    });

    it('сброс в пустое значение очищает разметку', (): void => {
        const fixture: ComponentFixture<RtDeltaViewComponent> = setup(delta([{ insert: 'Текст\n' }]));

        fixture.componentRef.setInput('delta', null);
        fixture.detectChanges();

        expect(html(fixture)).toBe('');
    });
});
