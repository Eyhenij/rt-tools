import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    EnvironmentProviders,
    input,
    InputSignal,
    Provider,
    signal,
    Signal,
    WritableSignal,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RtIconComponent } from '../../../../lib/components/icon/rt-icon.component';
import { provideRtKitLabels, TRtKitLabelKey, TRtKitTranslator } from '../../../../lib/i18n';
import { createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { provideRtAiChatBlock } from './blocks/rt-ai-chat-blocks.providers';
import { RtAiChatComponent } from './rt-ai-chat.component';
import { RtAiChatMessageExtraDirective } from './rt-ai-chat.directives';
import { IRtAiChat } from './rt-ai-chat.model';

const PARTIAL_TEXT: string = 'Продажи за ноябрь выросли на';

/** Двойник буфера: настоящий в среде без браузера ничего не кладёт и молчит об этом. */
class ClipboardDouble {
    public readonly copied: string[] = [];

    public copy(text: string): boolean {
        this.copied.push(text);

        return true;
    }
}

/** Блок, которого кит не знает: отрисовщик без текста для копии. */
@Component({
    selector: 'rt-ai-chat-chart-stub',
    template: '<span qa-dataid="chart-stub">chart</span>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ChartStubComponent {
    public readonly block: InputSignal<IRtAiChat.Block> = input.required<IRtAiChat.Block>();
}

@Component({
    selector: 'rt-ai-chat-interrupted-host',
    template: `
        <rt-ai-chat
            [messages]="messages()"
            [sending]="sending()"
            [error]="error()"
            [copyable]="copyable()"
            (send)="sent.push($event)"
            (retry)="retried = retried + 1"
            (askAgain)="askedAgain.push($event)"
            (feedbackChange)="feedback.push($event)">
            @if (withExtra()) {
                <ng-template let-message rtAiChatMessageExtra>
                    <span qa-dataid="extra">{{ message.id }}</span>
                </ng-template>
            }
        </rt-ai-chat>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAiChatComponent, RtAiChatMessageExtraDirective],
})
class InterruptedHostComponent {
    public readonly messages: WritableSignal<readonly IRtAiChat.Message[]> = signal<readonly IRtAiChat.Message[]>([]);
    public readonly sending: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<IRtAiChat.RunError | null> = signal<IRtAiChat.RunError | null>(null);
    public readonly copyable: WritableSignal<boolean> = signal<boolean>(true);
    public readonly withExtra: WritableSignal<boolean> = signal<boolean>(false);
    public readonly sent: string[] = [];
    public readonly askedAgain: string[] = [];
    public readonly feedback: IRtAiChat.FeedbackChange[] = [];
    public retried: number = 0;
}

let clipboard: ClipboardDouble;

function partial(id: string, extra: Partial<IRtAiChat.AssistantMessage> = {}): IRtAiChat.AssistantMessage {
    return { id, role: 'assistant', blocks: [{ type: 'markdown', text: PARTIAL_TEXT }], interrupted: true, ...extra };
}

function empty(id: string, extra: Partial<IRtAiChat.AssistantMessage> = {}): IRtAiChat.AssistantMessage {
    return { id, role: 'assistant', blocks: [], interrupted: true, ...extra };
}

function setup(
    state: Partial<Record<keyof InterruptedHostComponent, unknown>>,
    providers: (Provider | EnvironmentProviders)[] = []
): ComponentFixture<InterruptedHostComponent> {
    clipboard = new ClipboardDouble();
    const fixture: ComponentFixture<InterruptedHostComponent> = createRtFixture(
        InterruptedHostComponent,
        {},
        { skipInitialDetect: true, providers: [{ provide: Clipboard, useValue: clipboard }, ...providers] }
    );
    const host: InterruptedHostComponent = fixture.componentInstance;

    for (const [key, value] of Object.entries(state)) {
        (host[key as keyof InterruptedHostComponent] as WritableSignal<unknown>).set(value);
    }
    fixture.detectChanges();

    return fixture;
}

function nodes<T>(fixture: ComponentFixture<T>, id: string): HTMLElement[] {
    return qaAll(fixture, id).map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

/** Кнопка внутри обёртки `rt-icon-button` или `rt-ai-chat-copy` — та, что получает нажатие. */
function buttonOf(node: HTMLElement): HTMLButtonElement {
    return node.tagName === 'BUTTON' ? (node as HTMLButtonElement) : (node.querySelector('button') as HTMLButtonElement);
}

function askAgainButtons<T>(fixture: ComponentFixture<T>): HTMLButtonElement[] {
    return nodes(fixture, 'ai-chat-ask-again').map(buttonOf);
}

function press<T>(fixture: ComponentFixture<T>, id: string, index: number = 0): void {
    buttonOf(nodes(fixture, id)[index]).click();
    fixture.detectChanges();
}

/** Первый узел стоит раньше второго в порядке документа; узлы не вложены друг в друга. */
function precedes(first: Element, second: Element): boolean {
    return first.compareDocumentPosition(second) === Node.DOCUMENT_POSITION_FOLLOWING;
}

/** Порядок строки действий: `qa-dataid` каждого ребёнка, у обёртки копирования его нет. */
function rowOrder(row: HTMLElement): (string | null)[] {
    return Array.from(row.children).map((child: Element): string | null => child.getAttribute('qa-dataid'));
}

describe('RtAiChatComponent — прерванный ответ', (): void => {
    it('SC-UKV-1563 — частичный ответ рисует текст, под ним строку «прерван», под ней копирование, «спросить снова» и оценку', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m1')] });
        const block: HTMLElement = nodes(fixture, 'ai-chat-block-markdown')[0];
        const label: HTMLElement = nodes(fixture, 'ai-chat-interrupted')[0];
        const row: HTMLElement = nodes(fixture, 'ai-chat-feedback')[0];
        const icon: RtIconComponent = qaAll(fixture, 'ai-chat-ask-again')[0].query(By.directive(RtIconComponent))
            .componentInstance as RtIconComponent;

        expect(textOf(block)).toBe(PARTIAL_TEXT);
        expect(textOf(label)).toBe('Answer interrupted');
        expect(precedes(block, label) && precedes(label, row)).toBe(true);
        expect(rowOrder(row).slice(1)).toEqual(['ai-chat-ask-again', 'ai-chat-like', 'ai-chat-dislike']);
        expect(row.firstElementChild?.contains(nodes(fixture, 'ai-chat-copy')[0])).toBe(true);
        expect(icon.name()).toBe('sync');
        expect(askAgainButtons(fixture)[0].getAttribute('aria-label')).toBe('Ask again');
    });

    it('SC-UKV-1564 — пустой прерванный ответ рисует строку и ряд с одной кнопкой «спросить снова»', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [empty('m1')] });

        expect(textOf(nodes(fixture, 'ai-chat-interrupted')[0])).toBe('Answer interrupted');
        expect(rowOrder(nodes(fixture, 'ai-chat-feedback')[0])).toEqual(['ai-chat-ask-again']);
        expect(qa(fixture, 'ai-chat-answer-blocks')).toBeNull();
        expect(qa(fixture, 'ai-chat-copy')).toBeNull();
        expect(qa(fixture, 'ai-chat-like')).toBeNull();
        expect(qa(fixture, 'ai-chat-run')).toBeNull();
    });

    it('SC-UKV-1565 — пустой прерванный ответ держит строку хода и вложения над строкой «прерван»', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({
            withExtra: true,
            messages: [empty('m1', { run: { state: 'stopped', label: 'Stopped' } })],
        });
        const answer: HTMLElement = nodes(fixture, 'ai-chat-answer')[0];
        const order: (string | null)[] = Array.from(answer.querySelectorAll('[qa-dataid]'))
            .filter((node: Element): boolean => node.parentElement?.closest('[qa-dataid]') === answer)
            .map((node: Element): string | null => node.getAttribute('qa-dataid'));

        expect(order).toEqual(['ai-chat-run', 'extra', 'ai-chat-interrupted', 'ai-chat-feedback']);
    });

    it('SC-UKV-1566 — ответ без флага, с false и с ходом «failed» строки «прерван» не рисует', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({
            messages: [
                { id: 'a', role: 'assistant', blocks: [{ type: 'markdown', text: 'A' }] },
                { id: 'b', role: 'assistant', blocks: [{ type: 'markdown', text: 'B' }], interrupted: false },
                { id: 'c', role: 'assistant', blocks: [], run: { state: 'failed', label: 'Failed' } },
            ],
        });

        expect(qa(fixture, 'ai-chat-interrupted')).toBeNull();
        expect(qa(fixture, 'ai-chat-ask-again')).toBeNull();
    });

    it('SC-UKV-1567 — нажатие «спросить снова» отдаёт askAgain с id ответа на каждое нажатие и ничего больше', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m1')] });
        const host: InterruptedHostComponent = fixture.componentInstance;

        press(fixture, 'ai-chat-ask-again');
        press(fixture, 'ai-chat-ask-again');

        expect(host.askedAgain).toEqual(['m1', 'm1']);
        expect([host.retried, host.sent]).toEqual([0, []]);
        expect(nodes(fixture, 'ai-chat-interrupted')).toHaveLength(1);
        expect(askAgainButtons(fixture)).toHaveLength(1);
    });

    it('SC-UKV-1568 — пока идёт отправка, «спросить снова» отключено и молчит, после — снова отдаёт id', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ sending: true, messages: [partial('m1')] });
        const host: InterruptedHostComponent = fixture.componentInstance;
        const button: HTMLButtonElement = askAgainButtons(fixture)[0];

        button.click();
        fixture.detectChanges();

        expect(button.disabled).toBe(true);
        expect(host.askedAgain).toEqual([]);

        host.sending.set(false);
        fixture.detectChanges();
        press(fixture, 'ai-chat-ask-again');

        expect(host.askedAgain).toEqual(['m1']);
    });

    it('SC-UKV-1569 — пока ответ пишется, строки и кнопки нет; с концом потока они появляются', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m1', { streaming: true })] });

        expect(qa(fixture, 'ai-chat-interrupted')).toBeNull();
        expect(qa(fixture, 'ai-chat-ask-again')).toBeNull();

        fixture.componentInstance.messages.set([partial('m1')]);
        fixture.detectChanges();

        expect(nodes(fixture, 'ai-chat-interrupted')).toHaveLength(1);
        expect(askAgainButtons(fixture)).toHaveLength(1);
    });

    it('SC-UKV-1570 — частичный ответ оценивается как любой', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m1')] });

        press(fixture, 'ai-chat-like');

        expect(fixture.componentInstance.feedback).toEqual([{ messageId: 'm1', feedback: 'liked' }]);
    });

    it('SC-UKV-1571 — копия частичного ответа — текст блоков без строки «прерван» и «спросить снова»', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m1')] });

        press(fixture, 'ai-chat-copy');

        expect(clipboard.copied).toEqual([PARTIAL_TEXT]);
    });

    it('SC-UKV-1572 — ошибка хода отдаёт свой retry, ответ — свой askAgain', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({
            messages: [partial('m1')],
            error: { message: 'The assistant could not finish.', retryable: true },
        });
        const host: InterruptedHostComponent = fixture.componentInstance;

        press(fixture, 'ai-chat-retry');

        expect([host.retried, host.askedAgain]).toEqual([1, []]);

        press(fixture, 'ai-chat-ask-again');

        expect([host.retried, host.askedAgain]).toEqual([1, ['m1']]);
    });

    it('SC-UKV-1573 — несколько прерванных ответов называют каждый свой id', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({
            messages: [partial('m1'), { id: 'm2', role: 'assistant', blocks: [{ type: 'markdown', text: 'Whole' }] }, partial('m3')],
        });

        press(fixture, 'ai-chat-ask-again', 1);
        press(fixture, 'ai-chat-ask-again', 0);

        expect(fixture.componentInstance.askedAgain).toEqual(['m3', 'm1']);
        expect(nodes(fixture, 'ai-chat-answer')[1].querySelector('[qa-dataid="ai-chat-interrupted"]')).toBeNull();
    });

    it('SC-UKV-1574 — строка в вежливой живой области ленты, кнопка названа и поясняется строкой своего ответа', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m 1'), partial('m/1')] });
        const labels: HTMLElement[] = nodes(fixture, 'ai-chat-interrupted');
        const buttons: HTMLButtonElement[] = askAgainButtons(fixture);
        const ids: string[] = labels.map((label: HTMLElement): string => label.id);

        expect(
            labels.map((label: HTMLElement): (string | null)[] => [label.getAttribute('aria-live'), label.getAttribute('role')])
        ).toEqual([
            [null, null],
            [null, null],
        ]);
        expect(labels[0].closest('[aria-live]')?.getAttribute('aria-live')).toBe('polite');
        expect(buttons.map((button: HTMLButtonElement): string | null => button.getAttribute('aria-label'))).toEqual([
            'Ask again',
            'Ask again',
        ]);
        expect(buttons.map((button: HTMLButtonElement): string | null => button.getAttribute('aria-describedby'))).toEqual(ids);
        expect(new Set(ids).size).toBe(2);
        expect(ids.every((id: string): boolean => id.length > 0 && !/[\s/]/.test(id))).toBe(true);
        expect(
            buttons.map((button: HTMLButtonElement): string | null => button.querySelector('rt-icon')?.getAttribute('aria-hidden') ?? null)
        ).toEqual(['true', 'true']);
    });

    it('SC-UKV-1575 — подписи строки и кнопки берутся из переводчика кита', (): void => {
        const russian: Partial<Record<TRtKitLabelKey, string>> = { aiInterrupted: 'Ответ прерван', aiRetry: 'Спросить снова' };
        const translator: Signal<TRtKitTranslator> = signal<TRtKitTranslator>((key: TRtKitLabelKey): string => russian[key] ?? '');
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({ messages: [partial('m1')] }, [
            provideRtKitLabels({ translator }),
        ]);

        expect(textOf(nodes(fixture, 'ai-chat-interrupted')[0])).toBe('Ответ прерван');
        expect(askAgainButtons(fixture)[0].getAttribute('aria-label')).toBe('Спросить снова');
    });

    it('SC-UKV-1578 — строка «прерван» рисуется и при строке хода «running»', (): void => {
        const fixture: ComponentFixture<InterruptedHostComponent> = setup({
            messages: [partial('m1', { run: { state: 'running', label: 'Writing' } })],
        });

        expect(textOf(nodes(fixture, 'ai-chat-run')[0])).toContain('Writing');
        expect(precedes(nodes(fixture, 'ai-chat-block-markdown')[0], nodes(fixture, 'ai-chat-interrupted')[0])).toBe(true);
        expect(askAgainButtons(fixture)).toHaveLength(1);
    });

    it('SC-UKV-1579 — ответ без текста и чат без копирования держат строку, кнопку и оценку без «копировать»', (): void => {
        const rated: string[] = ['ai-chat-ask-again', 'ai-chat-like', 'ai-chat-dislike'];
        const noText: ComponentFixture<InterruptedHostComponent> = setup(
            { messages: [{ id: 'm1', role: 'assistant', blocks: [{ type: 'chart-stub' }], interrupted: true }] },
            [provideRtAiChatBlock('chart-stub', ChartStubComponent)]
        );

        expect(rowOrder(nodes(noText, 'ai-chat-feedback')[0])).toEqual(rated);
        expect(nodes(noText, 'ai-chat-interrupted')).toHaveLength(1);

        const copyOff: ComponentFixture<InterruptedHostComponent> = setup({ copyable: false, messages: [partial('m1')] });

        expect(rowOrder(nodes(copyOff, 'ai-chat-feedback')[0])).toEqual(rated);
        expect(qa(copyOff, 'ai-chat-copy')).toBeNull();
    });
});
