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

| вход                | тип                                                            | умолчание                    |
| ------------------- | -------------------------------------------------------------- | ---------------------------- |
| `imageUrl`          | `string \| null`                                               | `null`                       |
| `fileName`          | `string`                                                       | `'image'`                    |
| `tooltip`           | `string`                                                       | `''` → `uiImageUploadChange` |
| `downloadable`      | `boolean`                                                      | `false`                      |
| `downloadShape`     | `'circle' \| 'square'`                                         | `'circle'`                   |
| `downloadIconSize`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| null`        | `null` → по размеру кнопки   |
| `removable`         | `boolean`                                                      | `false`                      |
| `buttonsCorner`     | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'`                |
| `buttonsPlacement`  | `'overhang' \| 'inside'`                                       | `'overhang'`                 |
| `buttonsVisibility` | `'auto' \| 'hover' \| 'always'`                                | `'auto'`                     |
| `chooseAppearance`  | `'filled' \| 'outlined' \| 'text'`                             | `'outlined'`                 |
| `chooseIcon`        | `string \| null`                                               | `'ico-upload'`               |
| `autoApply`         | `boolean`                                                      | `false`                      |
| `loading`           | `boolean`                                                      | `false`                      |
| `disabled`          | `boolean`                                                      | `false`                      |
| `ratio`             | `number \| null`                                               | `null`                       |
| `round`             | `boolean`                                                      | `false`                      |
| `format`            | `'png' \| 'jpeg' \| 'webp' \| null`                            | `null`                       |
| `quality`           | `number`                                                       | `92`                         |

Выходы: `imageChanged` (`File`), `downloaded`, `removed`.

## Главное, что нужно знать

**Место одно, и в нём одно состояние.** Загрузка приложения важнее всего, выбранный файл важнее
картинки, картинка важнее зоны загрузки. Картинка стоит на месте зоны, а не под ней.

**Нажатие на картинку выбирает другой файл**, а выбранный открывает обрезку. «Отмена» возвращает
прежнюю картинку, «Применить» ставит результат и отдаёт файл в `imageChanged`.

**Картинка — адрес.** Приложение даёт свой; адрес применённого файла загрузчик делает сам и отпускает,
когда картинку сменили или компонент ушёл. Новый `imageUrl` от приложения снова берёт верх.

**`autoApply` убирает кнопки:** каждый результат обрезки сразу становится картинкой и уходит
приложению, а обрезка остаётся открытой.

**`removable` рисует крестик, а картинку убирает приложение.** Нажатие отдаёт `removed` и ничего не
меняет в загрузчике: приложение удаляет файл у себя и убирает `imageUrl`. Крестик виден при наведении
на превью и при фокусе внутри него, на касании виден всегда; недоступный загрузчик его не показывает.
Подпись для экранного диктора — `uiRemove`.

**Кнопки стоят одним рядом у одного угла.** Угол задаёт `buttonsCorner`, вид — `buttonsPlacement`:
`overhang` выступает за угол картинки, `inside` ставит кнопки внутрь картинки, в 8 от её краёв.
Крестик стоит в самом углу, скачивание — рядом с ним.

**Когда кнопки видны, задаёт `buttonsVisibility`.** Без него всё как было: крестик виден при
наведении и фокусе, скачивание — всегда. `hover` прячет до наведения обе кнопки, `always` показывает
обе всегда. На касании кнопки видны при любом значении.

## Оформление снаружи

Свойства блока: `--rt-image-upload-image-max-height`, `--rt-image-upload-image-radius`,
`--rt-image-upload-hover-opacity`, `--rt-image-upload-focus-shadow`,
`--rt-image-upload-download-overhang`, `--rt-image-upload-download-bg`,
`--rt-image-upload-download-radius`, `--rt-image-upload-download-size` (размер кнопки скачивания,
по умолчанию шаг `--rt-control-height-md`), `--rt-image-upload-download-blur` (размытие под ней,
8px). Они объявлены на самом блоке, поэтому переопределяются
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
