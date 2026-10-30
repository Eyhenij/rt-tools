# Scenarios — the saved settings of rt-data-table under the kit's key

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1109 — an old record comes back under the kit key and stays where it was

Given settings saved under the table key "orders" alone, with one column hidden
When the table with the key "orders" and the same columns is opened
Then the column is drawn hidden, the record is written under "rt.data-table.config.orders" and the old record is not removed
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.

### SC-UKV-1110 — a record under the kit key wins over an old one

Given settings under "rt.data-table.config.orders" and other settings under "orders"
When the table with the key "orders" is opened
Then the table draws the settings under the kit key and does not read the old record
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.

### SC-UKV-1111 — a change goes under the kit key

Given the table with the key "orders"
When a person saves the settings
Then the settings are written under "rt.data-table.config.orders" and nothing is written under "orders"
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.

### SC-UKV-1112 — a reset removes both records

Given settings under the kit key and an old record under "orders"
When the settings of the table with the key "orders" are reset
Then both records are removed, and the next opening draws the declared columns
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.
