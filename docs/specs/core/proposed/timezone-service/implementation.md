# The binding — the time zone of the reader

- **The zone is asked of the environment only in the browser** — `timezone.service.ts:getCurrentTimezone`
- **Where there is nowhere to learn the zone of the reader from, the agreed zone is given** — `timezone.service.ts:FALLBACK_TIMEZONE`
- **The zone is read at every address** — `timezone.service.ts:getCurrentTimezone`
- **The address to the environment stands in the service, not in the caller** — `timezone.service.ts:RtTimezoneService`

The paths are from the root of the package: `projects/core/src/lib/services/`.

- **Scenario** — Test
- **`SC-CR-05`** — `timezone.service.spec.ts`
- **`SC-CR-06`** — `timezone.service.spec.ts`
- **`SC-CR-07`** — `timezone.service.spec.ts`
