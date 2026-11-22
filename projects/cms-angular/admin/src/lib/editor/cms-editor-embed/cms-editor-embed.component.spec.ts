import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsEditorEmbedComponent } from './cms-editor-embed.component';

@Component({
    selector: 'rt-cms-editor-embed-host',
    template: '<rt-cms-editor-embed [content]="address()" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CmsEditorEmbedComponent],
})
class EmbedHostComponent {
    public readonly address: WritableSignal<string> = signal<string>('');
}

/** The frame of the preview after the address is typed, or `null` when there is none. */
async function frameFor(address: string): Promise<HTMLIFrameElement | null> {
    TestBed.configureTestingModule({ imports: [EmbedHostComponent] });
    const fixture: ComponentFixture<EmbedHostComponent> = TestBed.createComponent(EmbedHostComponent);
    fixture.componentInstance.address.set(address);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('iframe');
}

describe('the embedded link of the editor', () => {
    it('SC-CMS-79 — an https address with a host reaches the frame of the preview', async () => {
        const frame: HTMLIFrameElement | null = await frameFor('  https://www.youtube.com/embed/abc?start=5  ');

        expect(frame?.getAttribute('src')).toBe('https://www.youtube.com/embed/abc?start=5');
    });

    it.each([
        ['a script address', 'javascript:alert(1)'],
        ['plain http', 'http://example.com/embed'],
        ['a data address', 'data:text/html,<script>alert(1)</script>'],
        ['text that does not parse', 'https:// example .com'],
        ['an https address without a host', 'https:'],
    ])('SC-CMS-79 — %s gives no preview frame', async (_case: string, address: string) => {
        expect(await frameFor(address)).toBeNull();
    });
});
