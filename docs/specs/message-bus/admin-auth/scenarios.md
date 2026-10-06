# Scenarios — the entry into the admin application

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
common numbering of the domain and do not change at a move between subdomains.

While a scenario is not covered, it carries the mark "Not covered" with a reason. The scenarios whose
"Then" names a person and what they see are closed by an end-to-end spec.

### SC-MB-33 — an entry by a fit pair opens the admin application

Given an account is created from the screens
When the owner names its name and password on the screen of the entry
Then the entry is created, and the owner sees the section of the incident analyses

### SC-MB-34 — a wrong password is refused without naming the reason

Given an account is created
When the owner names the right name and a wrong password
Then the entry is not created, and the refusal does not say what exactly did not match

### SC-MB-35 — an unknown name is refused by the same answer

Given there is no account with such a name
When its name is named on the screen of the entry
Then the answer is word for word the same as at a wrong password

### SC-MB-36 — an operation of the admin application without a token is refused

Given the request carries no access token of the bus client
When it arrives at any operation of the reading of the cargo
Then the intake refuses and says that the operation demands an entry

### SC-MB-37 — an expired entry stops being accepted

Given the term of the entry expired
When the reading of the list of the analyses arrives by it
Then the reading is refused, and the owner sees the screen of the entry

it is closed by an end-to-end spec together with the screens, task #587

### SC-MB-39 — a token of a tree does not open the operations of the admin application

Given a tree has a fit token
When it is presented to the reading of the list of the analyses
Then the reading is refused the same way as without an entry

### SC-MB-40 — the entry of a person does not open the intake of the cargo

Given a person holds a fit access token of the bus client
When the token is presented to an operation of the intake of the cargo
Then the intake is refused: it asks for a token of a tree, not for an entry

### SC-MB-42 — the creating stores the hash, not the password

Given there is no account with such a name
When the owner creates the record from the people section and names a password
Then the record is created, and the hash lies in the storage, not the password itself

### SC-MB-43 — a taken name of an account refuses the creating

Given a record with such a name is already created
When the creating is called with the same name
Then it refuses and creates no second record

## The sections and the addresses

### SC-MB-44 — a direct address of a section without an entry leads to the entry

Given the owner has not entered
When they open the address of the section of the analyses by a direct link
Then they see the screen of the entry, not an empty section

### SC-MB-45 — after the entry a person lands where they were going

Given the owner came by a link to the section of the analyses and was sent to the entry
When they name a fit pair
Then they see the section they came by the link to

### SC-MB-59 — a change of the password refuses the former one

Given the password of an account is changed from the people section
When the owner names the former pair
Then the entry is not created, and by the new pair it is created

### SC-MB-60 — the name of an account does not tell the case apart

Given the record `admin` is created
When the people section creates the record `Admin`
Then it refuses: the name is taken

### SC-MB-79 — an operation without a declared access does not open outward

Given a new operation without a declaration of the access is created in the intake
When a request without an entry and without a token of a tree arrives at it
Then it is refused, it does not answer

### SC-MB-417 — the intake names where the admin application signs in

Given the intake set up with a Keycloak realm and the bus client
When the admin application asks the settings of the entry without a token
Then the answer names the Keycloak address, the realm and the client, and nothing more
