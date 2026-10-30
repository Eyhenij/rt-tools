# What it is carried out by — the saved settings of rt-data-table under the kit's key

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree and the scenario it is checked by.

- **`rt-data-table` writes its settings under the kit key.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:dataTableConfigKeyOf`; scenario `SC-UKV-1111`
- **An old record is copied under the kit key on the first read and is not erased.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:initConfig`; scenario `SC-UKV-1109`
- **A record under the kit key wins over an old one.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:initConfig`; scenario `SC-UKV-1110`
- **A reset of the settings removes both records.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:deleteConfig`; scenario `SC-UKV-1112`
