import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsEditableDirective } from './cms-editable.directive';

@Component({
    selector: 'rt-cms-editable-host',
    template: '<div qa-dataid="editable" [rtCmsEditable]="html()" (htmlChange)="changes.push($event)"></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CmsEditableDirective],
})
class EditableHostComponent {
    public readonly html: WritableSignal<string> = signal<string>('');
    public readonly changes: string[] = [];
}

/** The editable element after the block HTML went into it. */
async function editableWith(html: string): Promise<{ element: HTMLElement; host: EditableHostComponent }> {
    TestBed.configureTestingModule({ imports: [EditableHostComponent] });
    const fixture: ComponentFixture<EditableHostComponent> = TestBed.createComponent(EditableHostComponent);
    fixture.componentInstance.html.set(html);
    await fixture.whenStable();
    const element: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="editable"]') as HTMLElement;
    return { element, host: fixture.componentInstance };
}

describe('the editable block HTML', () => {
    it('SC-CMS-80 — a script, an event handler and a script link of a block do not reach the editor', async () => {
        const { element } = await editableWith(
            'Text <img src="x" onerror="window.hit=1"><script>window.hit=2</script><a href="javascript:window.hit=3">link</a>'
        );

        expect(element.querySelector('script, img, [onerror]')).toBeNull();
        expect(element.querySelector('a')?.hasAttribute('href')).toBe(false);
        expect(element.textContent).toBe('Text link');
    });

    it('SC-CMS-80 — the emphasis style, the line break and the link attributes of a block stay', async () => {
        const html: string =
            '<b>bold</b> <span style="font-style: italic;">italic</span><br>' +
            '<a href="https://example.com" target="_blank" rel="noopener">site</a>';
        const { element } = await editableWith(html);

        expect(element.querySelector('b')?.textContent).toBe('bold');
        expect(element.querySelector('span')?.getAttribute('style')).toBe('font-style: italic;');
        expect(element.querySelectorAll('br')).toHaveLength(1);
        const link: HTMLAnchorElement | null = element.querySelector('a');
        expect([link?.getAttribute('href'), link?.getAttribute('target'), link?.getAttribute('rel')]).toEqual([
            'https://example.com',
            '_blank',
            'noopener',
        ]);
    });

    it('SC-CMS-80 — text without letters goes out empty and clears the element', async () => {
        const { element, host } = await editableWith('<b>x</b>');
        element.replaceChildren(element.ownerDocument.createTextNode('  '));

        element.dispatchEvent(new Event('input'));

        expect(element.childNodes).toHaveLength(0);
        expect(host.changes).toEqual(['']);
    });
});
