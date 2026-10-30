import { openStoryOverlay, openStoryOverlays, STORY_TRIGGER_ATTRIBUTE } from './story-overlay';

/**
 * Момент жеста — то, от чего зависит, где CDK поставит панель: дальше она за триггером следует
 * только при прокрутке и смене окна. Сам кадр проверяет прогон снимков; здесь стережётся порядок
 * «шрифты, потом жест», откат которого прогон ловит лишь изредка.
 */
describe('story-overlay', () => {
    let releaseFonts: () => void = (): void => undefined;
    let canvas: HTMLElement;
    let opened: number;

    beforeEach(() => {
        Object.defineProperty(document, 'fonts', {
            configurable: true,
            value: {
                ready: new Promise<void>((resolve: () => void): void => {
                    releaseFonts = resolve;
                }),
            },
        });

        opened = 0;
        canvas = document.createElement('div');
        for (let index: number = 0; index < 2; index++) {
            const trigger: HTMLButtonElement = document.createElement('button');
            trigger.setAttribute(STORY_TRIGGER_ATTRIBUTE, '');
            trigger.addEventListener('mouseenter', (): void => {
                opened++;
            });
            canvas.append(trigger);
        }
        document.body.append(canvas);
    });

    afterEach(() => {
        canvas.remove();
        Reflect.deleteProperty(document, 'fonts');
    });

    it('SC-UKV-06 — жест ждёт шрифтов страницы и случается, когда они пришли', async () => {
        const opening: Promise<void> = openStoryOverlay(canvas, { event: 'mouseenter' });

        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 200);
        });
        expect(opened).toBe(0);

        releaseFonts();
        await opening;

        expect(opened).toBe(1);
    });

    it('SC-UKV-06 — жест на всех хостах тоже ждёт шрифтов страницы', async () => {
        const opening: Promise<void> = openStoryOverlays(canvas, { event: 'mouseenter' });

        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 200);
        });
        expect(opened).toBe(0);

        releaseFonts();
        await opening;

        expect(opened).toBe(2);
    });
});
