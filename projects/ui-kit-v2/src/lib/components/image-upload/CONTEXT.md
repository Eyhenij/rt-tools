# `rt-image-upload`

Загрузчик одного изображения: логотип, аватар, обложка. Одно место, в котором по очереди стоят зона
загрузки, обрезка и сама картинка.

```html
<rt-image-upload
    downloadable
    fileName="logo.png"
    tooltip="Логотип. Нажмите, чтобы заменить"
    [imageUrl]="logoUrl"
    (imageChanged)="upload($event)" />
```

| вход           | тип                                 | умолчание                    |
| -------------- | ----------------------------------- | ---------------------------- |
| `imageUrl`     | `string \| null`                    | `null`                       |
| `fileName`     | `string`                            | `'image'`                    |
| `tooltip`      | `string`                            | `''` → `uiImageUploadChange` |
| `downloadable` | `boolean`                           | `false`                      |
| `autoApply`    | `boolean`                           | `false`                      |
| `loading`      | `boolean`                           | `false`                      |
| `disabled`     | `boolean`                           | `false`                      |
| `ratio`        | `number \| null`                    | `null`                       |
| `round`        | `boolean`                           | `false`                      |
| `format`       | `'png' \| 'jpeg' \| 'webp' \| null` | `null`                       |
| `quality`      | `number`                            | `92`                         |

Выходы: `imageChanged` (`File`), `downloaded`.

## Главное, что нужно знать

**Место одно, и в нём одно состояние.** Загрузка приложения важнее всего, выбранный файл важнее
картинки, картинка важнее зоны загрузки. Картинка стоит на месте зоны, а не под ней.

**Нажатие на картинку выбирает другой файл**, а выбранный открывает обрезку. «Отмена» возвращает
прежнюю картинку, «Применить» ставит результат и отдаёт файл в `imageChanged`.

**Картинка — адрес.** Приложение даёт свой; адрес применённого файла загрузчик делает сам и отпускает,
когда картинку сменили или компонент ушёл. Новый `imageUrl` от приложения снова берёт верх.

**`autoApply` убирает кнопки:** каждый результат обрезки сразу становится картинкой и уходит
приложению, а обрезка остаётся открытой.

## Оформление снаружи

Свойства блока: `--rt-image-upload-image-max-height`, `--rt-image-upload-image-radius`,
`--rt-image-upload-hover-opacity`, `--rt-image-upload-focus-shadow`,
`--rt-image-upload-download-inset`, `--rt-image-upload-download-bg`,
`--rt-image-upload-download-radius`. Они объявлены на самом блоке, поэтому переопределяются
правилом на `.rt-image-upload`, а не на `:root`. Зона загрузки берёт свойства
`--rt-empty-state-frame-*`, обрезка — `--rt-image-cropper-*`.

## Края

- Брошенный файл не-изображение пропускается, зона остаётся как была.
- Недоступный загрузчик не берёт файлов и не открывает выбор; скачивание остаётся.
- Обрезка, не прочитавшая файл, закрывается, как по «Отмене».

## Рядом

- [`rt-image-cropper`](../image-cropper/CONTEXT.md) — обрезка сама по себе, без выбора файла.
- [`rt-file-drop`](../file-drop/CONTEXT.md) и [`rt-empty-state`](../empty-state/CONTEXT.md) — из них
  собрана зона загрузки.
