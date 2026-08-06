# `rt-file-list`

Раскладка перечня файлов. Входов, выходов и своей разметки нет — только отступы и перенос.

```html
<rt-file-list>
    <rt-file-card *ngFor="…" … />
</rt-file-list>
```

## Главное, что нужно знать

**Это чистая раскладка.** Что показывать — карточки [`rt-file-card`](../file-card/CONTEXT.md),
ссылки [`rt-download-link`](../download-link/CONTEXT.md) или свои строки — решает потребитель.
Пустоту и загрузку тоже рисует он: у списка нет ни заглушки, ни состояния.

## Проверки

[`rt-file-list.component.spec.ts`](./rt-file-list.component.spec.ts).
