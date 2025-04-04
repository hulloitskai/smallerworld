# smallerworld

_a smaller world for you and your friends._

## setup

```bash
# install tools
brew install docker rbenv nodenv pyenv poetry watchman overmind

# install libraries
brew install libvips

# set up environment
git clone git@github.com:hulloitskai/smallerworld
cd smallerworld
bin/setup
```

## todos

- [x] show upcoming events when not logged in
- [x] hide link href when not logged in
- [x] correct pinned posts order
- [x] add background gradients to user themes
- [x] auto-open notification settings after enable push notifs for first time
- [x] send notification when friend installs your smaller world
- [x] use chips instead of checkboxes for notification settings
- [x] send join invites using platform of user's choice
- [x] register device ID when creating push registration
  - [?] "make your own smaller world!" onscreen prompt
- [x] show notification settings panel before enabling push notifs
- [x] implement our own auth (bye Supabase!)
- [x] keep user timezone up to date
- [x] add 'follow-up' post type
- [x] save drafts of new posts
- [ ] add android/ios chrome add-to-homescreen instructions
- [ ] onboarding redo (invite 3 friends, etc.)
- [ ] make better landing page video
  - shows you going in and out of different worlds
  - shows you creating a post
  - shows a friend getting your post
  - shows friend replying to your post
- [ ] arrow still isn't that obvious for enable push notifs
  - don't allow scrolling until enabled?
- [ ] remove old supabase auth code
