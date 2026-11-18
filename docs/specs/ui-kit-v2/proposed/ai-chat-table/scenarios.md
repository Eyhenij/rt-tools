# Scenarios — the table block of the assistant chat

The numbers continue the numbering of the kit and do not change after the merge. A scenario with no
test yet carries the mark «Not covered» with the reason.

### SC-UKV-1396 — the kit draws a table block without a registration

Given an answer with a `table` block and an application that registered a renderer for `table`
When the answer is drawn
Then the block is drawn by the kit as a table, and the registered renderer is not used

Not covered: the block is not written yet.

### SC-UKV-1397 — number columns stand right, text columns left

Given a block with a `text` column and a `number`, a `percent` and a `currency` column
When the block is drawn
Then the cells and the head cells of the three number columns are aligned right, those of the `text` column left

Not covered: the block is not written yet.

### SC-UKV-1398 — a value is written by its column type and the locale

Given the columns `number`, `percent` and `currency` with `EUR`, and a row 1250000.567, 0.1234, 1200
When the table is drawn in the `en` locale
Then the cells read «1,250,000.57», «12.3%» and «€1,200.00»

Not covered: the block is not written yet.

### SC-UKV-1399 — a currency column without a valid code writes a number

Given a `currency` column without a code and one with the code `rub`
When the value 1200.5 is drawn in both
Then both cells read as the `number` format writes 1200.5, with no currency sign

Not covered: the block is not written yet.

### SC-UKV-1400 — a value below zero takes the error text colour

Given a `currency` column in rubles with the values −10, 0 and 15, and a total of −5
When the table is drawn in the `ru` locale
Then −10 and the total are written as `Intl.NumberFormat` writes them for `ru` and take `--rt-color-state-error-text`, while 0 and 15 keep the text colour

Not covered: the block is not written yet.

### SC-UKV-1401 — a non-number in a number column stands as given

Given a `number` column with the values «n/a» and «-12»
When the table is drawn
Then the cells read «n/a» and «-12» as given, aligned right, neither coloured

Not covered: the block is not written yet.

### SC-UKV-1402 — a short row is filled and a long row is cut

Given three columns, a row of two values, a row of four values and a row with `null` in the middle
When the table is drawn
Then every row has three cells: the short row ends with an empty cell, the fourth value of the long row is absent, and the `null` cell is empty

Not covered: the block is not written yet.

### SC-UKV-1403 — an unknown column type is text

Given a column of the type `date` with the value 1200 and a column with no type
When the table is drawn
Then both columns are aligned left and the value reads «1200», not formatted

Not covered: the block is not written yet.

### SC-UKV-1404 — a block without rows keeps its head and «Copy CSV»

Given a block with columns, an empty `rows` and a total row
When the block is drawn
Then it shows the head row, the total row and «Copy CSV»

Not covered: the block is not written yet.

### SC-UKV-1405 — a broken table block is the plate

Given a `table` block with an empty `columns`, and one whose `rows` is not a list
When the answer is drawn
Then each is the plate with the type name «table», and the blocks around them stay in place

Not covered: the block is not written yet.

### SC-UKV-1406 — the total row stands after the rows

Given a block with three rows and a total row
When the block is drawn
Then the total row stands in `tfoot` after the three rows, semibold, with a top border

Not covered: the block is not written yet.

### SC-UKV-1407 — a wide table scrolls inside the block

Given a block with twelve columns in a feed 328 wide
When the block is drawn
Then the block and the feed keep their width, and the table scrolls sideways inside the scroll box

Not covered: held by the frame of the story with twelve columns at 328, the block is not written yet.

### SC-UKV-1408 — the head row stays on top while the rows scroll

Given a block taller than the maximum height of the scroll box
When the scroll box is scrolled down
Then the head row stays on the top of the box and the rows pass under it

Not covered: held by the frame of the scrolled story, the block is not written yet.

### SC-UKV-1409 — number columns keep one line and the first column wraps

Given four columns, the first holding «Апартаменты у моря», in a block 328 wide
When the block is drawn
Then every number value stands on one line in a column as wide as its widest value, and the first column wraps its text between words

Not covered: held by the frame of the narrow story, the block is not written yet.

### SC-UKV-1410 — the CSV escapes commas, quotes and line breaks

Given a `text` column with the values «Москва, центр», «Вилла "Море"» and a value with a line break
When «Copy CSV» is pressed
Then the clipboard holds these fields as `"Москва, центр"`, `"Вилла ""Море"""` and the third in double quotes with its line break, and the lines are separated by CRLF

Not covered: the block is not written yet.

### SC-UKV-1411 — the CSV carries raw numbers

Given the columns `number`, `percent` and `currency` with `RUB`, a row 1234.5, 0.25, −10 and a total row
When «Copy CSV» is pressed in the `ru` locale
Then the head line is the column labels, the row line holds 1234.5, 0.25 and -10 with no grouping and no signs, and the total row is the last line

Not covered: the block is not written yet.

### SC-UKV-1412 — «Copied» stands for two seconds and is announced

Given a drawn block
When «Copy CSV» is pressed and the clipboard takes the text
Then the button reads «Copied» with a check, a screen reader hears it as a status, and after two seconds the button reads «Copy CSV» again

Not covered: the block is not written yet.

### SC-UKV-1413 — a refused copy leaves the button as it was

Given a drawn block and a clipboard that refuses the text
When «Copy CSV» is pressed
Then the button keeps reading «Copy CSV»

Not covered: the block is not written yet.

### SC-UKV-1414 — the answer copy gives the table as tab-separated lines

Given an answer with a markdown block and a table block with a total row in the `en` locale
When «Copy» of the answer is pressed
Then the table part is the head, the rows and the total row as tab-separated lines with the values written as the table shows them

Not covered: the block is not written yet.

### SC-UKV-1415 — a drawn table follows the locale

Given a drawn table with a `number` column holding 1234.5 in the `en` locale
When the kit locale changes to `de`
Then the cell reads «1.234,5»

Not covered: the block is not written yet.

### SC-UKV-1416 — a markdown table is aligned by its divider row

Given a markdown table with the divider `| :-- | :-: | --: | --- |`
When `rt-markdown-text` draws it
Then its columns are aligned left, centre, right and left, the head cells as their columns

Not covered: the markdown table does not read the divider yet.

### SC-UKV-1417 — a markdown table takes the look of the block

Given a markdown table with a cell «-10»
When `rt-markdown-text` draws it
Then it has the head row, rows and bottom borders of the table block and scrolls sideways inside its own box, while «-10» keeps the text colour and no «Copy CSV» stands under it

Not covered: the look is to be held by the frame of the markdown story, which does not have it yet.

### SC-UKV-1418 — a markdown row is fitted to the head

Given a markdown table with three head cells, a row of two cells and a row of four
When `rt-markdown-text` draws it
Then each row has three cells: the short one ends with an empty cell, the fourth cell of the long one is absent

Not covered: the markdown table does not fit its rows yet.

### SC-UKV-1419 — the table is read as a table

Given a block with a total row
When a screen reader reads it
Then the head cells are `th` with `scope="col"`, the total row is in `tfoot`, and the scroll box is reachable by Tab and named «Table»

Not covered: the block is not written yet.

### SC-UKV-1420 — several blocks keep their own «Copied»

Given an answer with two table blocks
When «Copy CSV» of the first is pressed
Then only the first reads «Copied», and the second keeps «Copy CSV»

Not covered: the block is not written yet.

### SC-UKV-1421 — a CSV text field that a spreadsheet would run is prefixed

Given a `text` column with the values «=SUM(A1:A2)», «@user», «-скидка» and a `number` column with −10
When «Copy CSV» is pressed
Then the text fields are `'=SUM(A1:A2)`, `'@user` and `'-скидка`, and the number field is `-10` with no apostrophe

Not covered: the block is not written yet.
