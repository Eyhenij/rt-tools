---
name: seo-page
kind: pattern
rule: seo
description: Паттерн правила seo. Брать, когда правится разметка страницы публичного сайта, заводится новый маршрут или новая страница должна попасть в карту сайта — готовый вызов PropertySeoService, ветки локалей в app.routes.ts, строка в sitemap. Не брать для проверки отданной разметки — это паттерн seo-verify.
---

# Разметка страницы публичного сайта

Паттерн правила `seo`. Что при этом должно быть верно — закон
`docs/constitution/application/search-visibility.md`.

## Когда брать

- Правится шаблон страницы сайта, её заголовок, описание или картинка для соцсетей.
- Заводится новый маршрут сайта.
- Появилась страница, которая должна попасть в `sitemap.xml`.

## Разметку ставит сервис, а не шаблон

Страница собирает данные и одним вызовом отдаёт их `PropertySeoService`. Своих `<meta>` в
шаблоне не заводить: они не помечены `data-<префикс>-seo`, не переписываются при переходе и
переживут смену страницы.

Образец — `property-page.component.ts:#applySeo`:

```typescript
readonly #seo: PropertySeoService = inject(PropertySeoService);

constructor() {
    effect((): void => this.#applySeo());
}

#applySeo(): void {
    const property: IProperty.State | null = this.property();
    if (!property) {
        return;
    }

    const name: string = this.propertyName();
    const cover: IPhotoView | null = this.coverDesktop();

    this.#seo.apply({
        property,
        name,
        pageTitle: name ? `${name} — ${this.#titleSuffix()}` : this.#titleSuffix(),
        description: property.shortDescription || this.#descriptionFallback(),
        ogImageUrl: cover ? photoOgUrl(cover.baseUrl) : `${SITE_ORIGIN}/${BRAND_OG_IMAGE}`,
        ogImageAlt: cover ? cover.alt : name,
        ogImageWidth: OG_IMAGE_WIDTH,
        ogImageHeight: OG_IMAGE_HEIGHT,
        locale: this.#localeId,
    });
}
```

Вызов идёт из `effect`, а не из конструктора напрямую: объект приходит сигналом, и на первом
кадре его ещё нет. Ранний выход по пустому объекту обязателен — без него разметка встала бы на
пустых значениях и второй раз уже не переписалась бы.

У картинки есть запасной вариант: объект без обложки отдаёт брендовое изображение того же формата,
иначе превью в соцсети пустует.

## Новый маршрут заводится веткой на каждую локаль

Ветки собирает `apps/site/src/app/app.routes.ts` из `LOCALE_CODES`. Локаль по умолчанию своей
ветки не имеет — она отдаётся из корня.

```typescript
export const appRoutes: Route[] = [
    ...LOCALE_CODES.filter((code: ELocale): boolean => code !== DEFAULT_LOCALE).map((code: ELocale): Route => ({
        path: code,
        children: propertyRoutes,
    })),
    ...propertyRoutes,
];
```

Новый путь дописывается в `propertyRoutes` — тогда он появляется во всех восьми ветках сразу.
Ветки перечислены явными кодами, а не `:locale`: иначе `/<адрес страницы>` был бы принят за
язык, а не за адрес объекта.

## Страница попадает в карту сайта явно

Карта строится из объектов, а не из маршрутов, и новая страница сама туда не попадёт. Записи
собирает `buildSitemap` (`libs/site/property/util/src/lib/sitemap.util.ts`), отдаёт обработчик
`/sitemap.xml` в `apps/site/src/server.ts`. Правка идёт вместе со спекой в
`sitemap.util.spec.ts`.

## Тексты идут из словарей

`pageTitle` и `description` собираются из переведённых значений и заводятся во всех восьми
локалях. Без перевода они уезжают в выдачу по-английски, и заметно это только в чужой локали.

## Частые промахи

- `<meta>` в шаблоне вместо вызова сервиса — тег не помечен `data-<префикс>-seo` и переживёт переход.
- Вызов без раннего выхода по пустому объекту — разметка встаёт на пустых значениях.
- Новый путь дописан мимо `propertyRoutes` — работает только в локали по умолчанию,
  `/de/<путь>` отдаёт 404.
- Свой разбор адреса вместо `splitRequestUrl` — теряется всё после второго `?`, и источник
  заявки считается неверно.
- Правка разметки без проверки на прод-сборке: в дев-сервере теги ставит не тот путь. Проверка
  описана паттерном `seo-verify`.
