/**
 * Docs-wide enhancer: makes every inline `<code>` element whose text is exactly
 * a design-token name (`--rt-*` / `--clr-*`) copyable with one click.
 *
 * React-safe by design: we only set `data-*` attributes on existing elements and
 * draw the copy icon via a CSS `::after` pseudo-element — no extra DOM nodes are
 * inserted, so the docs page re-renders never conflict. The click handler is
 * delegated from `document`. Code blocks (`<pre>`) are skipped on purpose.
 */
/* eslint-disable */

const TOKEN_RE: RegExp = /^--(rt|clr)-[a-z0-9]+(-[a-z0-9]+)*$/;
const TOKEN_ATTR: string = 'data-rt-token';
const COPIED_ATTR: string = 'data-rt-copied';

const COPY_SVG: string =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'.replace(
            /%23/g,
            '#'
        )
    );

const CHECK_SVG: string =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#21b18e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    );

const STYLE: string = `
code[${TOKEN_ATTR}] {
    cursor: pointer;
}
code[${TOKEN_ATTR}]::after {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-left: 0.4em;
    vertical-align: -0.08em;
    background: url("${COPY_SVG}") center / contain no-repeat;
    opacity: 0.45;
    transition: opacity 0.15s ease;
}
code[${TOKEN_ATTR}]:hover::after {
    opacity: 1;
}
code[${TOKEN_ATTR}][${COPIED_ATTR}]::after {
    background-image: url("${CHECK_SVG}");
    opacity: 1;
}
`;

function copyText(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts
    const area: HTMLTextAreaElement = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    return Promise.resolve();
}

function markTokens(root: ParentNode): void {
    const candidates: NodeListOf<HTMLElement> = root.querySelectorAll<HTMLElement>(`code:not([${TOKEN_ATTR}])`);
    candidates.forEach((code: HTMLElement): void => {
        const token: string = (code.textContent ?? '').trim();
        if (!TOKEN_RE.test(token) || code.closest('pre')) {
            return;
        }
        code.setAttribute(TOKEN_ATTR, token);
        code.title = `Copy ${token}`;
    });
}

function onClick(event: MouseEvent): void {
    const target: Element | null = event.target instanceof Element ? event.target : null;
    const code: HTMLElement | null = target ? target.closest<HTMLElement>(`code[${TOKEN_ATTR}]`) : null;
    if (!code) {
        return;
    }
    const token: string = code.getAttribute(TOKEN_ATTR) ?? '';
    void copyText(token).then((): void => {
        code.setAttribute(COPIED_ATTR, '');
        window.setTimeout((): void => {
            code.removeAttribute(COPIED_ATTR);
        }, 1200);
    });
}

function setup(): void {
    const style: HTMLStyleElement = document.createElement('style');
    style.setAttribute('data-rt-token-copy', '');
    document.head.appendChild(style);
    style.textContent = STYLE;

    document.addEventListener('click', onClick, true);

    markTokens(document.body);
    const observer: MutationObserver = new MutationObserver((): void => {
        markTokens(document.body);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

export function setupTokenCopy(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }
    if (document.querySelector('style[data-rt-token-copy]')) {
        return; // already initialised (HMR re-run)
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
}
