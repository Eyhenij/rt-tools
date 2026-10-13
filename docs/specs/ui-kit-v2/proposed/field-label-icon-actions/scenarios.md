# Scenarios — the field's label on the border, actionable icons and the clearing cross

Numbers continue the second kit's numbering and do not change after the merge. While a scenario is
not covered, it carries the mark «Не покрыто» with the reason.

### SC-UKV-856 — the option template replaces the row label

Given the select holds an option template
When the list is opened
Then each row draws the template with its option, and the check mark stays on the chosen row

Не покрыто: кода ещё нет.

### SC-UKV-857 — without an option template the row draws the label

Given the select holds no option template
When the list is opened
Then each row draws the option label as before

Не покрыто: кода ещё нет.

### SC-UKV-858 — the label on the border lies at the placeholder's place on an empty field

Given the input names a label on the border and holds no value
When the field is drawn at rest
Then the label is not risen and the native field has no placeholder

Не покрыто: кода ещё нет.

### SC-UKV-859 — the label rises on a value and on focus

Given the input names a label on the border
When the field gets a value, or the field is focused while empty
Then the label is risen

Не покрыто: кода ещё нет.

### SC-UKV-860 — the select's label rises on a value and on an open list

Given the select names a label on the border
When an option is chosen, or the list is opened while nothing is chosen
Then the label is risen

Не покрыто: кода ещё нет.

### SC-UKV-861 — the label names the control without an aria label

Given the field names a label on the border and no aria label
When the field is drawn
Then the control is named by the label's text

Не покрыто: кода ещё нет.

### SC-UKV-862 — an actionable icon is a button reported by its output

Given the input marks its left icon as actionable
When the icon is pressed by the mouse, by Enter or by Space
Then the left output reports each press, and the focus does not move into the native field

Не покрыто: кода ещё нет.

### SC-UKV-863 — an actionable icon carries a tooltip and a name

Given the input marks its right icon as actionable and gives it a tooltip
When the field is drawn
Then the icon button is named by the tooltip text and shows it on hover and focus

Не покрыто: кода ещё нет.

### SC-UKV-864 — an icon not marked as actionable stays a picture

Given the input names icons and marks neither as actionable
When the field is drawn
Then no icon is a button

Не покрыто: кода ещё нет.

### SC-UKV-865 — the cross enters the Tab order on demand

Given the input or the select asks for a tabbable cross and holds a value
When the field is drawn
Then the cross is reached by the Tab key; without the demand it stays out of the order

Не покрыто: кода ещё нет.

### SC-UKV-866 — clearing reports to the host

Given a field holds a value
When the cross is pressed
Then the form gets the empty value first, and the clearing output fires once after it

Не покрыто: кода ещё нет.
