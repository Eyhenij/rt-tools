# Scenarios — the match rule of a search

The prefix `SC-UKV` is shared across the domain together with the subdomains.
The numbers do not change after the merge. What covers a scenario is said under it.

### SC-UKV-889 — the words of a query find a row in any order

Given a row «Отчёт за март»
When the query is «март отчёт»
Then the row matches

Covered by the spec of the shared search module.

### SC-UKV-890 — a missing word drops the row

Given a row «Отчёт за март»
When the query is «отчёт апрель»
Then the row does not match

Covered by the spec of the shared search module.

### SC-UKV-891 — case and «ё» do not matter

Given rows «Ёлка» and «ЕЛКА»
When the query is «елка» or «ЁЛКА»
Then both rows match

Covered by the spec of the shared search module.

### SC-UKV-892 — a query of spaces keeps every row and marks nothing

Given any row
When the query is empty or holds spaces alone
Then the row matches, and its label is one piece without a mark

Covered by the spec of the shared search module.

### SC-UKV-893 — the highlight marks every word, overlaps as one piece

Given a label «Мегамаркет Ёлка»
When the query is «мега гама елка»
Then «Мегама» is marked as one piece, «ркет» stays plain, and «Ёлка» is marked whole in the case
it was written in

Covered by the spec of the shared search module.

### SC-UKV-894 — every search place finds a row whose words stand in another order

Given the side menu, the tree walk, the dynamic selector and the tree selector, each with a row
«Отчёт за март»
When the query is «март отчёт»
Then each of them keeps that row

Covered by the logic specs of the side menu, the tree walk, the dynamic selector and the tree
selector.
