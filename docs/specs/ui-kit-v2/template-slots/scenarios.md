# Scenarios — template slots

The numbers continue the numbering of the second kit. The scenarios of the CMS list page and of the
admin list page are in the specs of their domains: `SC-CMS-81` and `SC-MB-456`.

### SC-UKV-1711 — the hint template of a field is not created under an error

Given a field with a hint template holding a component, without `reserveHintSpace`
When the field shows an error
Then the component of the hint is not built and the hint zone holds the error alone

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field.component.spec.ts`.

### SC-UKV-1712 — the actions template of a panel stands in the header row outside the toggle

Given an expansion panel with an actions template
When the panel is drawn and the action is pressed
Then the action stands between the title and the chevron outside the header button, and the panel
does not expand

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-1713 — the actions template of a nested panel stays with the nested panel

Given an expansion panel whose body holds a second panel with an actions template
When both panels are expanded
Then the actions stand in the header row of the nested panel and the outer header has none

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-1714 — the horizontal page header builds no rail templates

Given a page header in the horizontal layout with a rail logo template and a rail page template
When the header is drawn
Then neither template's content is built

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-slots.directive.spec.ts`.

### SC-UKV-1715 — the vertical page header draws the rail templates in the rail

Given a page header with `layout="vertical"`, a rail logo template and a rail page template
When the header is drawn
Then the logo stands at the top of the rail and the page content in the page place of the rail

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-slots.directive.spec.ts`.

### SC-UKV-1716 — the vertical page header builds no compact and bell templates

Given a page header with `layout="vertical"`, three compact templates and a bell template
When the header is drawn
Then none of the four templates' content is built

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-slots.directive.spec.ts`.

### SC-UKV-1717 — two bell templates stand at the header end in the order written

Given a horizontal page header with two bell templates, the assistant button first and the bell
second, and a user
When the header is drawn
Then the assistant button, the bell and the profile button stand at the end in this order

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-slots.directive.spec.ts`.

### SC-UKV-1718 — a hidden chat header builds no header actions

Given a chat with a header actions template and the header switched off
When the chat is drawn
Then the content of the header actions template is not built

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`.

### SC-UKV-1719 — a chat without a reply builds no composer bar

Given a chat with a composer bar template and a reason that forbids a reply
When the chat is drawn
Then the content of the composer bar template is not built and the reason is shown

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`.

### SC-UKV-1720 — composer tools are built only in the messenger field

Given a chat with a composer tools template and the plain reply field
When the chat is drawn
Then the content of the composer tools template is not built

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`.

### SC-UKV-1721 — a thread read with an error builds no chat footer

Given a chat with a footer template and a thread whose reading failed
When the chat is drawn
Then the error is shown and the content of the footer template is not built

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`.

### SC-UKV-1722 — the favourites handle given by a template still reorders the rows

Given the favourites block of the side menu with two rows
When the handle of the second row is focused and the up arrow is pressed
Then the second row becomes the first

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.directive.spec.ts`.

### SC-UKV-1723 — a folder row and its children draw no action

Given a side menu row for a folder without its own address, with two child pages, and an action
template
When the row is expanded and drawn
Then neither the folder row nor the rows of its children hold the action

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.directive.spec.ts`.

### SC-UKV-1724 — a closed menu builds no items

Given a menu with a content template of three items
When the menu is drawn closed
Then no item of the template is built

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.spec.ts`.

### SC-UKV-1725 — an opened menu draws its items and focuses the first

Given a closed menu with a content template of three items
When the trigger is pressed
Then the three items are drawn in the panel and the first holds the focus

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.spec.ts`.

### SC-UKV-1726 — a closed menu destroys the items it drew

Given an open menu with a content template
When the menu closes
Then the items of the template are destroyed

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.spec.ts`.

### SC-UKV-1727 — a press on a menu item reaches the handler of the consumer

Given a menu whose content template holds an item bound to a handler of the consumer
When the item is pressed
Then the handler runs and the menu closes

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.spec.ts`.

### SC-UKV-1728 — a loading icon button builds no content

Given an icon button without an icon, with a content template, in the loading state
When the button is drawn
Then the spinner stands in the button and the content of the template is not built

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button-content.directive.spec.ts`.

### SC-UKV-1729 — the breadcrumbs build their content only in the heading look

Given breadcrumbs in the inline look with a content template
When the breadcrumbs are drawn
Then the content of the template is not built

Covered: `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs-content.directive.spec.ts`.

### SC-UKV-1730 — the selector list under the invitation builds no add button

Given a dynamic selector with the `invitation` input, two chosen values and adding allowed
When the selector is drawn
Then the list shows the two rows and the add button is not built

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-invitation.spec.ts`.

### SC-UKV-1731 — a sortable header draws its label once, inside the sort button

Given a sortable column header with a label template
When the header is drawn
Then the label stands once, inside the sort button before the arrow

Covered: `projects/ui-kit-v2/src/lib/components/table/sort-header/rt-table-sort-header-content.directive.spec.ts`.

### SC-UKV-1732 — the showcase list page draws its toolbar templates on their sides

Given the showcase list page with a filter template on the left and an action template on the right
When the page is drawn
Then the filter stands on the left side of the toolbar and the action before the reload button

Covered: `projects/ui-kit-v2/src/showcase/templates/bookings/list-page/app-list-page.component.spec.ts`.

### SC-UKV-1733 — a confirmed menu action reaches the consumer after the menu closed

Given a menu item with a confirmation message, its dialog open and the menu closed
When the person confirms in the dialog
Then the item's `selected` reaches the consumer once
And a click outside the held panel, once no dialog covers it, drops the wait and the backdrop with it

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.spec.ts`.

### SC-UKV-1734 — the focus follows the handle of a moved favourite

Given the favourites block with two rows and the focus on the handle of the second row
When the up arrow is pressed
Then the focus stands on the handle of the row that became the first

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.directive.spec.ts`.

### SC-UKV-1735 — the chat footer is drawn while the thread loads

Given a chat with a footer template and an open thread being loaded
When the chat is drawn
Then the content of the footer template is drawn under the reply field

Covered: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`.

### SC-UKV-1736 — switching the header to the vertical layout destroys the bell

Given a horizontal page header with a bell template whose content is built
When `layout` becomes `vertical` on the live page
Then the content of the bell template is destroyed

Covered: `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-slots.directive.spec.ts`.

### SC-UKV-1737 — two actions templates of a panel stand in the order written

Given an expansion panel with two actions templates
When the panel is drawn
Then both actions stand in the header row, the first written first

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-1738 — a collapsed panel keeps its body node in the page, hidden and inert

Given a collapsed expansion panel with a body node holding a form field
When the panel is drawn
Then the body node is in the page, hidden and inert, and the field is a member of the outer form

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-1739 — an empty side panel builds no content

Given a side panel with a content template holding a form, marked empty
When the panel is drawn
Then the empty placeholder is shown and the form is not built

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-content.directive.spec.ts`.

### SC-UKV-1740 — a loading skeleton wrapper builds no content

Given a skeleton wrapper with a content template, loading
When the wrapper is drawn
Then the skeleton is shown and the content of the template is not built

Covered: `projects/ui-kit-v2/src/lib/components/skeleton-wrapper/rt-skeleton-wrapper-content.directive.spec.ts`.

### SC-UKV-1741 — a loading field keeps its control in the form, hidden under the skeleton

Given a field with a control bound to a form, loading
When the field is drawn
Then the skeleton is shown, the control is hidden and the form holds it

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field.component.spec.ts`.

### SC-UKV-1742 — a loading dynamic list builds no records

Given a dynamic list with a content template, loading for the first time
When the list is drawn
Then the loading state is shown and the content of the template is not built
And once the load ends the content is built, and an empty or failed list later hides it without
destroying it

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list-content.directive.spec.ts`.

### SC-UKV-1743 — a loading money row builds no value

Given a money row with a content template, loading
When the row is drawn
Then the skeleton stands in the value place and the content of the template is not built

Covered: `projects/ui-kit-v2/src/lib/components/money-list/rt-money-row-content.directive.spec.ts`.

### SC-UKV-1744 — a loading info item builds no value

Given an info item with a content template, loading
When the item is drawn
Then the skeleton stands in the value place and the content of the template is not built

Covered: `projects/ui-kit-v2/src/lib/components/info-item/rt-info-item-content.directive.spec.ts`.

### SC-UKV-1745 — the former form of a named slot warns in development mode

Given a field whose hint is written as an element with `rtFieldHint`, in development mode
When the field is drawn
Then the console holds a warning naming `rt-field`, `rtFieldHint` and the template form; the
element form of `rtMultiselectExtra` warns the same way, naming `rt-multiselect`

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field.component.spec.ts`,
`projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-extra.directive.spec.ts`.

### SC-UKV-1746 — a menu item outside the content template warns in development mode

Given a menu whose item is written without `rtMenuContent`, in development mode
When the menu is drawn
Then the console holds a warning naming `rt-menu` and `rtMenuContent`

Covered: `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.spec.ts`.
