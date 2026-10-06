# Scenarios — the example admin

The identifier goes at the start of the test title, followed by a dash.

### SC-AUTH-47 — a person enters through Keycloak and sees the records

Given the stand and a reader
When they open the example admin and enter their address and password on the screen of the realm
Then the admin opens with the list of records and their name

### SC-AUTH-48 — a wrong password keeps the person on the entry screen

Given the stand and a reader
When they enter a wrong password
Then the screen of the realm shows the refusal and the admin does not open

### SC-AUTH-49 — a token near its end is refreshed without a new entry

Given a reader in the admin whose token is near its end
When they reload the list
Then the token is refreshed, the list loads and the entry screen does not appear

### SC-AUTH-50 — sign out ends the session in Keycloak

Given a reader in the admin
When they press «Sign out» and open the admin again
Then the screen of the realm asks for the entry

### SC-AUTH-51 — a part without the right is not shown

Given a reader and an editor
When each of them opens the admin
Then only the editor sees the form «New record»

### SC-AUTH-52 — the server refuses a call without the right

Given a reader in the admin
When a record is created with their token
Then the example server answers 403

### SC-AUTH-53 — the entry page offers Google exactly when the stand holds the keys of the owner

Given the stand raised with or without the keys of Google
When the entry page of the realm is opened
Then the Google provider is switched on and offered only when the keys are given

Not covered: the command `check:auth-stand` asks a raised stand. It joins the gate before sending at stage 6 of task RT-2534
