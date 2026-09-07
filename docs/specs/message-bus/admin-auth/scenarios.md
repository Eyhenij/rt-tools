# Scenarios — the entry into the admin application

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
common numbering of the domain and do not change at a move between subdomains.

While a scenario is not covered, it carries the mark "Not covered" with a reason. The scenarios whose
"Then" names a person and what they see are closed by an end-to-end spec.

### SC-MB-33 — an entry by a fit pair opens the admin application

Given an account is created by a command of the launch line
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

### SC-MB-36 — an operation of the admin application without an entry is refused

Given the request has no entry
When it arrives at any operation of the reading of the cargo
Then the intake refuses and says that the operation demands an entry

### SC-MB-37 — an expired entry stops being accepted

Given the term of the entry expired
When the reading of the list of the analyses arrives by it
Then the reading is refused, and the owner sees the screen of the entry

it is closed by an end-to-end spec together with the screens, task #587

### SC-MB-38 — the exit breaks off the entry at once

Given the owner entered and pressed "Выйти"
When the reading of a list arrives by the former entry
Then it is refused, although the term of the entry has not run out yet

### SC-MB-39 — a token of a tree does not open the operations of the admin application

Given a tree has a fit token
When it is presented to the reading of the list of the analyses
Then the reading is refused the same way as without an entry

### SC-MB-40 — the entry of a person does not open the intake of the cargo

Given the owner entered the admin application
When their entry is presented to an operation of the intake of the cargo
Then the intake is refused: it asks for a token of a tree, not for an entry

### SC-MB-41 — an unsuccessful attempt of the entry is written into the journal without the password

Given a wrong pair is named on the screen of the entry
When the attempt is refused
Then a row with the name of the account stands in the journal, and there is no password in it

### SC-MB-42 — the command creates an account, and the storage holds the hash

Given there is no account with such a name
When the owner calls the command of the creating and names a password
Then the record is created, and the hash lies in the storage, not the password itself

### SC-MB-43 — a taken name of an account refuses the command

Given a record with such a name is already created
When the command of the creating is called with the same name
Then it refuses and creates no second record

### SC-MB-80 — unsuccessful attempts in a row lengthen the answer

Given by one and the same pair it was refused twice in a row
When a third attempt arrives
Then the answer to it comes later than to the first, and the account stays in force

## The sections and the addresses

### SC-MB-44 — a direct address of a section without an entry leads to the entry

Given the owner has not entered
When they open the address of the section of the analyses by a direct link
Then they see the screen of the entry, not an empty section

### SC-MB-45 — after the entry a person lands where they were going

Given the owner came by a link to the section of the analyses and was sent to the entry
When they name a fit pair
Then they see the section they came by the link to

### SC-MB-56 — the entry lies in a cookie unavailable to scripts

Given the owner entered the admin application
When the page asks the browser for the cookies by a script
Then the value of the entry is not among them, and the operations of the reading of the cargo answer

### SC-MB-57 — the exit breaks off the entry that was come by

Given the owner entered in two browsers
When they leave in one
Then the second entry goes on being accepted

### SC-MB-58 — a record that is switched off does not enter, and its former entries are refused

Given an account has a live entry
When it is switched off by a command of the launch line
Then the former entry stops being accepted, and a new one by its pair is not created

### SC-MB-59 — a change of the password refuses the former one

Given the password of an account is changed by a command
When the owner names the former pair
Then the entry is not created, and by the new pair it is created

### SC-MB-60 — the name of an account does not tell the case apart

Given the record `admin` is created
When the command creates the record `Admin`
Then it refuses, and the entry by the pair `Admin` is accepted the same as by `admin`

### SC-MB-61 — the service says at the start that there is not a single record

Given there is not a single account in the storage
When the intake goes up
Then it leaves in the journal a row saying that there are no records and what they are created by

### SC-MB-79 — an operation without a declared access does not open outward

Given a new operation without a declaration of the access is created in the intake
When a request without an entry and without a token of a tree arrives at it
Then it is refused, it does not answer
