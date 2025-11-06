# smallerworld

_your new secret blog, for close friends only._

## setup

```bash
# install tools
brew install docker mise watchman

# install libraries
brew install libvips

# set up environment
git clone git@github.com:hulloitskai/smallerworld
cd smallerworld
mise trust
mise install
bin/setup
```

## todos

### oct 2025

- [ ] needs to refresh after signup for the 'pin to home screen' to work
      properly
  - [ ] bug where installing your world from "create your world" button doesn't
        work immediately on Android
- [x] auto-push-registration when PWA is out-of-scope is creating duplicate user
      notifications

### archived todos

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
- [x] make better landing page video
  - shows you going in and out of different worlds
  - shows you creating a post
  - shows a friend getting your post
  - shows friend replying to your post
- [x] fix phone number login for new zealand and costa rica
- [x] zoom into images on fullscreen carousel
- [x] onboarding redo (invite 3 friends, etc.)
- [x] arrow still isn't that obvious for enable push notifs
  - don't allow scrolling until enabled?
- [x] inline rich text editor toolbar
- [x] launch new workbox-based service worker
- [x] smaller worldiverse feature
- [x] open 'create your own world' in mobile Safari on iOS
- [x] allow you to change icon of your smaller world as friend before you save
      it
- [x] make it easy to add friends from onboarding tutorial
- [x] show arrow to show where the create a post button lives (⬇️)
- [x] prevent isStandalone from triggering from smaller universe when clicking
      on a friend
- [-] some android devices don't open app from notification
- [x] macleod reply with telegram shows "user does not exist"???
- [x] better cta for user page welcome modal
- [x] make it easy for new users to request to join peppercoat's world
  - demo vibes on landing page?
- [x] features + feedback area of smaller world (click on the door to enter the
      shared area)
- [x] closeable prompt to open your world on mobile with qr code when on desktop
- [x] add android/ios chrome add-to-homescreen instructions
- [x] service worker versioning
- [x] you can download your own images from lightbox mode
- [x] remove old supabase auth code
