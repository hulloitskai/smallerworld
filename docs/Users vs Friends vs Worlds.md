# Users vs Friends vs Worlds

This document explains the core data model of the application, specifically how
`User`, `Friend`, and `World` relate to each other. Understanding this
distinction is critical for features like notifications, permissions, and
content visibility.

## The Core Trio

### 1. User (`app/models/user.rb`)

A **User** is a person who has registered for an account on the platform.

- **Identity**: Uniquely identified by `phone_number`.
- **Role**: An actor in the system who can create content, own a world, and view
  other worlds.
- **Ownership**: A User owns exactly one **World**.

### 2. World (`app/models/world.rb`)

A **World** is the "home base" or profile of a User.

- **Relationship**: Belongs to one `User` (the owner).
- **Content**: Contains the User's `Post`s.
- **Audience**: Has many `Friend`s (subscribers).

### 3. Friend (`app/models/friend.rb`)

A **Friend** represents a **one-way subscription** or relationship between an
external person and a specific **World**.

- **Scope**: A `Friend` record exists _inside_ a specific World.
- **Identity**: Linked to a real person via `phone_number`.
- **Duality**:
  - A `Friend` might be a registered `User`.
  - A `Friend` might _not_ be a registered `User` (e.g., someone who only
    receives SMS updates).
- **Cardinality**: If you have 10 friends, you have 10 `Friend` records in your
  World. If _you_ are friends with 5 people, there are 5 `Friend` records
  representing _you_ in those 5 different Worlds.

## The Relationship Graph

Unlike traditional social networks with a central "Friendship" table (where
`UserA` <-> `UserB`), this system is **federated per World**.

- **User A** has a World.
  - Inside User A's World, there is a `Friend` record for "Mom" (phone:
    555-0001).
  - Inside User A's World, there is a `Friend` record for "Bestie" (phone:
    555-0002).
- **User B** (Bestie) has their own World.
  - Inside User B's World, there might be a `Friend` record for "User A" (phone:
    555-0000).

This means "Friendship" is not automatically bidirectional. It is defined by the
existence of a `Friend` record in a specific World.

## Critical Implications

### 1. Identity & Deduplication

Because a person is represented as a `User` (globally) and as a `Friend`
(locally in many worlds), we often need to link them.

**The Link is the Phone Number.**

- **Scenario**: Sending a notification for a Public Post.
- **Goal**: Notify all `Friend`s of the World + all `User`s who subscribe to
  public posts.
- **The Conflict**: A person might be BOTH a `Friend` of the author AND a `User`
  who subscribes to public posts.
- **The Solution**:
  1.  Notify `Friend`s first (they get rich, world-specific context with access
      tokens).
  2.  Find `User`s to notify.
  3.  **Filter**: Exclude any `User` whose `phone_number` matches a `Friend` who
      was already notified.

**Do NOT** try to link them by comparing `User#world` to `Friend#world`.

- `User#world` is the world the User _owns_.
- `Friend#world` is the world the Friend _belongs to_ (the Author's world).
- These will never match for two different people.

### 2. Notification Context

- **As a Friend**: Notifications are personalized for that specific relationship
  (e.g., "Alice posted in her world"). Links usually include a `friend_token`
  for seamless authentication/access to that specific World.
- **As a User**: Notifications are generic (e.g., "New public post"). Links go
  to the global user interface.

### 3. Querying

When checking permissions or visibility:

- **"Is this User a friend?"** -> Check if
  `Friend.where(world: current_world, phone_number: user.phone_number)` exists.
- **"Who can see this?"** -> Visibility is often defined in terms of `Friend`
  records (e.g., `hidden_from_ids` stores `Friend` IDs, not `User` IDs).

## Summary Table

| Concept    | Scope                 | Identity Key                        | Represents                       |
| :--------- | :-------------------- | :---------------------------------- | :------------------------------- |
| **User**   | Global                | `id`, `phone_number`                | An account holder / Actor        |
| **World**  | Global                | `id`, `handle`                      | A User's container for content   |
| **Friend** | **Local (Per World)** | `id` (local), `phone_number` (link) | A subscriber to a specific World |

Always resolve `User` <-> `Friend` mapping via **Phone Number**.
