import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { ICmsSitePage } from './site-page.function';

/** The hreflang codes of the site per page language, as the application names its sites. */
export type TCmsHreflangsOfLocale = Readonly<Record<string, readonly string[]>>;

/** What the head of a site page is set by besides the page itself. */
export interface ICmsSitePageHead {
    /** The full address of the page, for the shared card. */
    readonly url: string;
    /** The page is a draft opened by a preview token: it is closed from indexing. */
    readonly preview: boolean;
    /** The languages the page address is published in. */
    readonly locales: readonly string[];
    readonly hreflangsOf: TCmsHreflangsOfLocale;
}

/**
 * The head of a site page drawn from the CMS: the title, the description and the shared card by the
 * page, a draft closed from indexing, and the `hreflang` links only of the sites where the page is
 * published in their language. The links taken down are put back when the page is left.
 */
@Injectable({ providedIn: 'root' })
export class SitePageHeadService {
    readonly #title: Title = inject(Title);
    readonly #meta: Meta = inject(Meta);
    readonly #doc: Document = inject(DOCUMENT);

    #hiddenAlternates: HTMLLinkElement[] = [];

    public apply(page: ICmsSitePage.State, head: ICmsSitePageHead): void {
        this.#title.setTitle(page.metaTitle);
        this.#meta.updateTag({ name: 'description', content: page.metaDescription });
        this.#meta.updateTag({ property: 'og:type', content: 'article' });
        this.#meta.updateTag({ property: 'og:title', content: page.metaTitle });
        this.#meta.updateTag({ property: 'og:description', content: page.metaDescription });
        this.#meta.updateTag({ property: 'og:url', content: head.url });
        this.#meta.updateTag({ property: 'article:published_time', content: page.publishedAt });
        if (page.imageSrc !== null) {
            this.#meta.updateTag({ property: 'og:image', content: page.imageSrc });
            this.#meta.updateTag({ property: 'og:image:alt', content: page.title });
        }
        this.#applyRobots(head.preview);
        this.#applyAlternates(new Set<string>(head.locales.flatMap((locale: string): readonly string[] => head.hreflangsOf[locale] ?? [])));
    }

    /** The page is left: the indexing ban is lifted and the taken-down links come back. */
    public clear(): void {
        this.#applyRobots(false);
        this.#applyAlternates(null);
    }

    #applyRobots(preview: boolean): void {
        if (preview) {
            this.#meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });

            return;
        }
        this.#meta.removeTag('name="robots"');
    }

    // `null` — the page is left: every link comes back.
    #applyAlternates(allowed: ReadonlySet<string> | null): void {
        this.#doc.head.append(...this.#hiddenAlternates);
        this.#hiddenAlternates = [];
        if (allowed === null) {
            return;
        }
        this.#doc.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((link: HTMLLinkElement): void => {
            if (!allowed.has(link.getAttribute('hreflang') ?? '')) {
                link.remove();
                this.#hiddenAlternates.push(link);
            }
        });
    }
}
