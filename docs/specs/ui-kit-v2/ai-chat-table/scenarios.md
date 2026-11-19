# Scenarios — the table block of the assistant chat

The numbers continue the numbering of the kit. A scenario with no test carries the mark «Not
covered» with the reason.

### SC-UKV-1396 — the kit draws a table block without a registration

Given an answer with a `table` block and an application that registered a renderer for `table`
When the answer is drawn
Then the block is drawn by the kit as a table, and the registered renderer is not used

### SC-UKV-1397 — number columns stand at the end, text columns at the start

Given a block with a `text` column and a `number`, a `percent` and a `currency` column
When the block is drawn, first under `dir="ltr"` and then under `dir="rtl"`
Then under `ltr` the cells and the head cells of the three number columns are aligned right and those of the `text` column left
And under `rtl` the sides mirror
And under `rtl` a written value of a number column keeps its own order: «-4,2 %» does not turn into «% 4,2-»

### SC-UKV-1398 — a value is written by its column type and the locale

Given the columns `number`, `percent` and `currency` with `EUR`, and a row 1250000.567, 0.1234, 1200
When the table is drawn in the `en` locale
Then the cells read «1,250,000.57», «12.3%» and «€1,200»

### SC-UKV-1399 — a currency column without a valid code writes a number

Given a `currency` column without a code and one with the code `rub`
When the value 1200.5 is drawn in both in the `en` locale
Then both cells read «1,200.5», with no currency sign

### SC-UKV-1400 — a value below zero takes the error text colour

Given a `currency` column with `RUB` holding the number -10, 0 and 15, and a total of the number -5
When the table is drawn in the `ru` locale
Then the cells read «-10 ₽» and «-5 ₽» with the space `Intl.NumberFormat` writes, and both take `--rt-color-state-error-text`
And 0 and 15 keep the text colour

### SC-UKV-1401 — a non-number in a number column stands as given

Given a `number` column with the values «n/a» and «-12»
When the table is drawn
Then the cells read «n/a» and «-12» as given, aligned as the column, neither coloured

### SC-UKV-1402 — rows are fitted to the columns and malformed parts dropped

Given three columns and a total row of four values
And the rows: one of two values, one of four values, one with `null` in the middle, one that is an object, one holding the value `true`
When the table is drawn
Then the object row is absent, and every other row and the total row have three cells
And the short row ends with an empty cell, and the fourth value of the long row is absent
And the `null` cell and the `true` cell are empty

### SC-UKV-1403 — an unknown column type is text, and a text column writes digits

Given a column of the type `date` with the value 1200, a column with no type, and a declared `text` column holding the number 1234.5
When the table is drawn in the `en` locale
Then the three columns are aligned to the start, the first reads «1200» and the third «1234.5», not formatted

### SC-UKV-1404 — a block without rows keeps its head and «Copy CSV»

Given a block with columns, an empty `rows` and a total row
When the block is drawn
Then it shows the head row, the total row and «Copy CSV»

### SC-UKV-1405 — a broken table block is the plate

Given a `table` block with an empty `columns`, and one whose `rows` is not a list
When the answer is drawn
Then each is the plate with the type name «table», and the blocks around them stay in place

### SC-UKV-1406 — the total row stands after the rows

Given a block with three rows and a total row
When the block is drawn
Then the total row stands in `tfoot` after the three rows, semibold, with a top border of the colour `--rt-color-border-default`

### SC-UKV-1407 — a wide table scrolls inside the block

Given a table block with twelve columns in a block 328 wide
When the block is drawn
Then the block and the feed keep their width, and the table scrolls sideways inside the scroll box

### SC-UKV-1408 — the head row stays on top while the rows scroll

Given a block taller than 200
When the scroll box is scrolled down
Then the scroll box is 200 high, the head row stays on its top and the rows pass under it

### SC-UKV-1409 — number columns keep one line and the first column wraps

Given four columns, the first holding «Апартаменты у моря» in one row, in a block 328 wide
When the block is drawn
Then every number value stands on one line in a column as wide as its widest value, and the first column wraps its text between words
And the row with the wrapped text is taller than 28, and the other rows are 28 high

### SC-UKV-1410 — the CSV escapes commas, quotes and line breaks

Given a `text` column with the values «Москва, центр», «Вилла "Море"» and a value with a line break
When «Copy CSV» is pressed
Then the clipboard holds these fields as `"Москва, центр"`, `"Вилла ""Море"""` and the third in double quotes with its line break, and the lines are separated by CRLF

### SC-UKV-1411 — the CSV carries raw numbers

Given the columns `number`, `percent` and `currency` with `RUB`, a row 1234.5, 0.25 and the number -10, and a total row
When «Copy CSV» is pressed in the `ru` locale
Then the head line is the column labels, the row line holds 1234.5, 0.25 and -10 with no grouping and no signs, and the total row is the last line

### SC-UKV-1412 — «Copied» stands for two seconds and is announced

Given a drawn block
When «Copy CSV» is pressed and the clipboard takes the text
Then the button reads «Copied» with a check, a screen reader hears it as a status, and after two seconds the button reads «Copy CSV» again

### SC-UKV-1413 — a refused copy leaves the button as it was

Given a drawn block and a clipboard that refuses the text
When «Copy CSV» is pressed
Then the button keeps reading «Copy CSV»

### SC-UKV-1414 — the answer copy gives the table as tab-separated lines

Given an answer with a markdown block and a table block with a total row in the `en` locale, one value holding a tab and a line break
When «Copy» of the answer is pressed
Then the table part is the head, the rows and the total row as tab-separated lines joined by LF, the values written as the table shows them
And the tab and the line break of that value are spaces

### SC-UKV-1415 — a drawn table follows the locale

Given a drawn table with a `number` column holding 1234.5 in the `en` locale
When the kit locale changes to `de`
Then the cell reads «1.234,5»

### SC-UKV-1416 — a markdown table is aligned by its divider row

Given a markdown table with the divider `| :-- | :-: | --: | --- |`
When `rt-markdown-text` draws it, first under `dir="ltr"` and then under `dir="rtl"`
Then under `ltr` its columns are aligned left, centre, right and left, the head cells as their columns
And under `rtl` the left and the right mirror

### SC-UKV-1417 — a markdown table takes the look of the block

Given a markdown table of thirty rows with a cell «-10»
When `rt-markdown-text` draws it
Then it has the head row, rows and bottom borders of the table block and scrolls sideways inside its own box
And it has no maximum height and no sticky head, «-10» keeps the text colour, and no «Copy CSV» stands under it
And its head cells are `th` with `scope="col"`, and its scroll box is reachable by Tab and named «Table»

### SC-UKV-1418 — a markdown row is fitted to the head

Given a markdown table with three head cells, a row of two cells and a row of four
When `rt-markdown-text` draws it and the answer holding it is copied
Then each row has three cells: the short one ends with an empty cell, the fourth cell of the long one is absent
And the answer copy carries the same fitted rows

### SC-UKV-1419 — the table is read as a table

Given a block with a total row, taller and wider than its scroll box
When a screen reader reads it and the keyboard reaches the scroll box
Then the head cells are `th` with `scope="col"` and the total row is in `tfoot`
And the scroll box is reachable by Tab, named «Table», and scrolls by the arrow keys
And «Copy CSV», «Copied» and «Table» are labels of the `rtKit` namespace

### SC-UKV-1420 — several blocks keep their own «Copied» and scroll box

Given an answer with two table blocks taller than 200
When the scroll box of the first is scrolled down and «Copy CSV» of the first is pressed
Then only the first reads «Copied» and is scrolled, and the second keeps «Copy CSV» and its top position

### SC-UKV-1421 — a CSV text field that a spreadsheet would run is prefixed

Given a `text` column labelled «=Итог» with the values «=SUM(A1:A2)», «@user», «-скидка», «+7 999», a value starting with a tab and a value starting with a CR
And a `number` column holding the number -10 in one row and «-12» given as a string in another
When «Copy CSV» is pressed
Then the head field is `'=Итог` and the text fields are `'=SUM(A1:A2)`, `'@user`, `'-скидка` and `'+7 999`
And the tab value stands bare with an apostrophe before its tab, and the CR value stands in double quotes with the apostrophe inside them
And the string «-12» is `'-12`, while the number field is `-10` with no apostrophe

### SC-UKV-1422 — an all-number table is as wide as its content

Given a table block of three `number` columns with short values in a block 328 wide
When the block is drawn
Then the table is as wide as its content, narrower than the block, and no column takes left-over width

### SC-UKV-1423 — the answer copy follows the locale

Given an answer with a table block whose `number` column holds 1234.5, drawn in the `en` locale
When the kit locale changes to `de` and «Copy» of the answer is pressed
Then the table part of the answer copy reads «1.234,5»

### SC-UKV-1424 — an empty total is absent

Given three blocks with an empty `rows`, whose `total` is `null`, an empty list and a row of `null` cells
When each is drawn, copied as CSV and copied with the answer
Then each draws the head row alone with no `tfoot`
And its CSV is the head line alone, and its answer copy is the head line alone

### SC-UKV-1425 — the rows and the head take the mockup metrics in both themes

Given a block with a head row, three rows and a total row
When it is drawn in the light and in the dark theme
Then the rows are 28 high with 8 of horizontal cell padding and a 12 px font
And the head row stands on the surface background with muted semibold text, in both themes

Not covered: held by the frames of the stories `Themes` and `Presets` at 328.

### SC-UKV-1426 — a currency writes the digits of its currency

Given a `currency` column with `JPY` holding 1200.5
When the table is drawn in the `en` locale
Then the cell reads «¥1,201»

### SC-UKV-1427 — a refused locale writes values as `en`

Given a kit locale `Intl.NumberFormat` refuses and a `number` column holding 1234.5
When the table is drawn
Then the cell reads «1,234.5»

### SC-UKV-1428 — a zero form has no minus, and a non-finite value is empty

Given a `number` column holding -0.001, `NaN` and an infinity
When the table is drawn in the `en` locale and copied as CSV
Then the first cell reads «0» in the text colour, and the other two cells are empty
And the CSV holds -0.001 and two empty fields

### SC-UKV-1429 — a new input keeps the scroll position and «Copied»

Given a block whose scroll box is scrolled down and whose button reads «Copied»
When the input `block` brings the same table with one more row
Then the table holds the new row, the scroll position stays, and the button still reads «Copied»

### SC-UKV-1430 — «Copy CSV» copies the rows drawn while the answer is written

Given an answer still written whose table block holds two rows
When «Copy CSV» is pressed
Then «Copy CSV» stands and the CSV holds the head line and those two rows

### SC-UKV-1431 — a press while «Copied» restarts, a locale change does not

Given a block whose button reads «Copied» for one second
When «Copy CSV» is pressed again, and later the kit locale changes to `ru`
Then the text is copied again, and «Copied» stays two seconds from the second press
And after the locale change it reads «Скопировано» without restarting the two seconds

### SC-UKV-1432 — every row is drawn

Given a block with five hundred rows
When the block is drawn
Then the table holds five hundred rows inside the scroll box

### SC-UKV-1433 — a block the schema accepts is drawn whole

Given the exported table schema and a block with four typed columns, three rows and a total that the schema accepts
When the block data is read
Then no column, row, value or total is dropped or emptied
And a block with an object row is refused by the schema and still drawn without that row

### SC-UKV-1434 — the chart data table takes the block's look

Given a chart block with its data table open in a block 328 wide
When it is drawn next to a table block
Then both have rows at least 28 high, 8 of horizontal cell padding and the same head row, and the number columns of both are as wide as their widest value

### SC-UKV-1435 — a title stands above the table and names it

Given a table block with the title «Выручка по типам номеров» and one without a title
When both are drawn and the answer is copied
Then the first shows the title above the table and its scroll box is named by the title, and the second has no title and its scroll box is named «Table»
And the answer copy opens the first table with the title on a line of its own, and its CSV holds no title
