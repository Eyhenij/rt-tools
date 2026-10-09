import { inject, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';

/**
 * Адрес пункта так, как его строит ссылка роутера: относительно маршрута, на котором стоит меню.
 * Им строка подменю и переходит, и подписывает `href` — для средней кнопки и копирования ссылки.
 */
export function sideMenuLinkTree(router: Router, route: ActivatedRoute | null, link: string): UrlTree {
    return router.createUrlTree([link], { relativeTo: route ?? undefined });
}

/** `href` строки подменю. Переход строка делает сама: ссылка роутера не дала бы потребителю его взять. */
@Pipe({
    name: 'rtSideMenuHref',
})
export class RtSideMenuHrefPipe implements PipeTransform {
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute | null = inject(ActivatedRoute, { optional: true });

    public transform(link: string | undefined): string | null {
        return link ? this.#router.serializeUrl(sideMenuLinkTree(this.#router, this.#route, link)) : null;
    }
}
