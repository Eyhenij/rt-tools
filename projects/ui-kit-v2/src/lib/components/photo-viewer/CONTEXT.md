# `rt-photo-viewer`

Полноэкранный просмотр кадров. Открывается через [`RtDialogService`](../dialog/CONTEXT.md).

```typescript
const ref: RtDialogRef<number> = this.#dialog.open<RtPhotoViewerComponent, IRtPhotoViewer.Data, number>(RtPhotoViewerComponent, {
    data: { photos, startIndex: 2, panel: this.panelTpl },
});
ref.afterClosed().subscribe((lastIndex?: number): void => scrollListTo(lastIndex));
```

Данные приходят токеном `RT_DIALOG_DATA`: `photos`, `startIndex`, необязательный `panel`
(шаблон подвала, получает текущий кадр и его номер).

## Главное, что нужно знать

**При закрытии отдаётся номер кадра, на котором закрыли.** Список за просмотрщиком
прокручивается к тому же кадру — иначе пользователь терял бы место.

**Лента замкнута**: с последнего кадра вперёд — на первый, с первого назад — на последний.

**Рисуются только текущий и соседние кадры.** Длинная лента разом не грузится; остальные
`<figure>` остаются пустыми до подхода.

## Края

- Фокус ставит сам компонент (`role="dialog"`, `tabindex="-1"`), а `cdkTrapFocus` держит Tab
  внутри без авто-захвата — иначе клавиши переставали бы листать.
- Стрелки-кнопки не рисуются, если кадр один.
- Управление кадром (удалить, сделать обложкой) приходит снаружи шаблоном `panel`.
