# The contract of the CMS — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **A broken body string reads as an empty body, and a block of an unknown kind is dropped.** — `projects/cms-contract/src/lib/content-body.function.ts:parseContentBody`
- **A broken block content reads as empty, not as a failure.** — `projects/cms-contract/src/lib/block-content.function.ts:blockJsonOf`
- **The page state and the redirect kind go to the contract by one table, and an unknown contract redirect kind reads as permanent.** — `projects/cms-contract/src/lib/content-item-status.ts:CONTENT_ITEM_STATUS_CONTRACT`, `projects/cms-contract/src/lib/content-item-status.ts:redirectTypeOfContract`
- **The page contents are the H2 headings of the body in order, as text without markup, and an empty heading is left out.** — `projects/cms-contract/src/lib/site-page.function.ts:siteContentsOf`
- **A page path is its own link, or its address under the section root the application names.** — `projects/cms-contract/src/lib/site-page.function.ts:sitePathOf`
- **A redirect answers 301 or 302 and carries the query string into the new address unless that address has its own.** — `projects/cms-contract/src/lib/site-page.function.ts:siteRedirectOf`
- **The redirect list is reread at most once per its time; when the CMS server does not answer, the previous list stays, and without one there is no redirect.** — `projects/cms-contract/src/lib/site-page.function.ts:cachedSiteRedirects`
- **An editor emphasis reaches the page as an emphasis tag, and the styled span is dropped with all its attributes.** — `projects/cms-contract/src/lib/site-page.function.ts:siteHtmlOf`
