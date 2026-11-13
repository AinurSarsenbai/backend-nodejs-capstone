
# User Story: User Registration

## User Story

As a new user, I need to register an account so that I can securely access the SecondChance platform and share or find reusable household items.

## Details and Assumptions

- The user has a valid email address.
- The user provides a name, email, and password.
- Each email address must be unique.
- Passwords must be stored securely using hashing.
- The registration API uses the POST method.
- MongoDB stores registered user information.

## Acceptance Criteria

1. The user can register with a name, email, and password.
2. All required fields must be provided.
3. The system rejects duplicate email addresses.
4. Passwords are securely hashed before storage.
5. Successful registration returns a confirmation message.

## Priority

High

## Story Points

3

## Status

New
