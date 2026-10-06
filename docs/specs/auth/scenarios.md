# Scenarios — the entry module

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason.

### SC-AUTH-1 — the stand is ready when the raising command returns

Given the stand is not raised
When the raising command is run
Then it returns only when Keycloak, its database and the mail catcher are healthy, and the realm loader exited with code 0

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files

### SC-AUTH-2 — the discovery document names the realm issuer on the stand port

Given the stand is raised
When the discovery document of the realm is read
Then it names the issuer of the realm on the stand port and the S256 challenge method

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files

### SC-AUTH-3 — the example client takes only the code flow with PKCE

Given the stand is raised
When the example client is read and asked for a password grant
Then it is public, requires PKCE S256, and the password grant is refused as a road the client does not have

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files

### SC-AUTH-4 — a letter of the realm lands in the mail catcher

Given the stand is raised and a user has an address
When the realm sends that user a letter
Then the mail catcher holds the letter, and nothing leaves the machine

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files

### SC-AUTH-5 — a second raising returns the realm to the file

Given the realm was edited in the console of a running stand
When the realm loader runs again
Then the realm matches the file again

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files

### SC-AUTH-53 — the entry page offers Google exactly when the stand holds the keys of the owner

Given the stand raised with or without the keys of Google
When the entry page of the realm is opened
Then the Google provider is switched on and offered only when the keys are given

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files
