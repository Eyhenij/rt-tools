# Scenarios — the usage of the rules over all trees

Numbered together with the usage spec they merge into.

### SC-MB-428 — a reading without a tree counts all trees

- **Given** two trees with loads of one skill over the period
- **When** the table is read without `tree`
- **Then** the skill is one row with the loads of both trees

### SC-MB-429 — an unknown named tree is refused

- **Given** a tree sign the receiver does not know
- **When** the table is read with that sign
- **Then** the answer is `404` with the code `treeUnknown`

### SC-MB-430 — the section with «Все проекты» shows the table

- **Given** the section opened with no tree in the address
- **When** the page is read
- **Then** the table shows rows instead of the read refusal
