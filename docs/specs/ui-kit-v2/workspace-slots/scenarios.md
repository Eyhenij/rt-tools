# Scenarios — the slots of the workspace and the panels that are not declared

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-145 — a workspace with the centre alone draws one panel

Given a workspace inside which only the template of the centre is declared
When it is drawn
Then neither the list panel nor the details panel is in the markup, neither handle is in the markup,
and the centre takes the whole width of the host

Covered by the component spec of the workspace.

### SC-UKV-146 — an undeclared panel takes its handle away with it

Given a workspace inside which the templates of the list and of the centre are declared, and the one
of the details is not
When it is drawn
Then the list handle is in the markup and the details handle is not

Covered by the component spec of the workspace.

### SC-UKV-147 — a closed details panel stays drawn

Given a workspace with all three templates declared, and the details panel is closed
When it is drawn
Then the details panel and its handle are in the markup

Covered by the component spec of the workspace.
