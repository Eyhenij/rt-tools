# Scenarios — the page header's «More» item

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain.

### SC-UKV-870 — a wide header has no «More»

Given a header whose sections all fit its width
When it is drawn
Then every section stands in the row and there is no «More» item

### SC-UKV-871 — a narrow header moves the last sections into «More»

Given a header narrower than the sum of its sections
When it is drawn and then narrowed further
Then the sections from the end leave the row, «More» stands last, and the row is counted again on
the narrowing

### SC-UKV-872 — the least important leave first

Given sections with different importance
When the row is fitted
Then the lowest importance leaves first, equal importance sends the one further from the start, and
the order of the rest does not change

### SC-UKV-873 — the «More» panel shows the moved sections

Given a header with a section with a panel moved into «More»
When «More» is opened
Then the panel names the section as a heading with its groups and items under it

### SC-UKV-874 — the selected section inside «More» highlights it

Given a header whose selected section is moved into «More», and one whose selected section is in the row
When each is drawn
Then the first highlights «More» and marks the line in its panel, the second leaves «More» plain

### SC-UKV-875 — a narrow container is not widened by the header

Given a header inside a container that sizes itself by its content
When it is drawn
Then the container keeps its width and the sections that do not fit stand in «More»

Not covered: a test has no layout at all — the width is seen by the showcase frame of the header
themes, where the header stands in grid cells.
