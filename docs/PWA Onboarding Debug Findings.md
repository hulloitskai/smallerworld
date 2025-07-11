# PWA Onboarding Issue - Debug Findings

## Problem Summary

The PWA installation prompt isn't appearing when users complete registration and land on their newly created world page. The issue is caused by a PWA scope mismatch during the registration flow.

## Root Cause Analysis

### The Flow
1. User installs an existing world on their phone as a PWA
2. Inside that world, they tap "Create Your Own World" (found in `AppMenu.tsx`)
3. This opens a registration page in a new in-app browser
4. After registering, they should land on their newly created world page with an install prompt

### The Issue
The registration page redirects using `location.href = routes.world.show.path()` without carrying PWA scope information, causing the PWA scope detection to fail.

## Technical Details

### PWA Scope Detection Logic
In `app/helpers/pwa.ts`, the `useOutOfPWAScope()` function checks if the current URL starts with the `pwa_scope` query parameter:

```typescript
export const useOutOfPWAScope = (): boolean => {
  const { url } = usePage();
  return useMemo(() => {
    const { pwa_scope: pwaScope } = queryParamsFromPath(url);
    if (pwaScope) {
      return !url.startsWith(pwaScope);
    }
    return false;
  }, [url]);
};
```

### World Page Install Logic
In `WorldPage.tsx`, the install modal only shows when specific conditions are met:

```typescript
useEffect(() => {
  if (isStandalone === undefined || !isEmpty(modals)) {
    return;
  }
  if (params.intent === "installation_instructions") {
    openWorldPageInstallationInstructionsModal({ currentUser });
  } else if (
    params.intent === "install" ||
    ((!isStandalone || outOfPWAScope) &&
      !!browserDetection &&
      (install || !isDesktop(browserDetection)))
  ) {
    openWorldPageInstallModal({ currentUser });
  }
}, [isStandalone, browserDetection, install]);
```

The key condition `(!isStandalone || outOfPWAScope)` fails when `outOfPWAScope` is `true`.

### PWA Scope Management
- PWA scope is set via `AppMeta` component using `pwaScope` prop
- World manifest has scope set to `/world` (see `WorldsController#manifest`)
- `PWAScopedLink` component handles scope preservation during navigation
- Registration page bypasses this system by using `location.href` directly

## The Fix

Updated `RegistrationPage.tsx` to include the PWA scope parameter in the redirect URL:

```typescript
onSuccess: () => {
  // Use location.href instead of router.visit in order to force browser
  // to load new page metadata for pin-to-homescreen + PWA detection.
  // Add pwa_scope parameter to ensure proper PWA scope detection.
  const worldUrl = new URL(routes.world.show.path(), location.origin);
  worldUrl.searchParams.set("pwa_scope", "/world");
  location.href = worldUrl.toString();
},
```

## Key Files Examined

- `app/helpers/pwa.ts` - PWA scope detection logic
- `app/pages/WorldPage.tsx` - World page with install modal logic
- `app/pages/RegistrationPage.tsx` - Registration flow and redirect
- `app/components/PWAScopedLink.tsx` - PWA scope preservation component
- `app/components/AppMeta.tsx` - PWA scope meta tag generation
- `app/controllers/worlds_controller.rb` - World manifest generation
- `config/routes.rb` - Route definitions
- `app/components/AppMenu.tsx` - "Create Your Own World" link

## Testing Recommendations

1. Test the complete registration flow from an existing world PWA
2. Verify that the install prompt appears after registration
3. Ensure the new world can be installed as a separate PWA
4. Test on both iOS and Android devices
5. Verify that the PWA scope is correctly preserved throughout the flow

## Alternative Solutions Considered

1. **Modify `useOutOfPWAScope()`** - Could fall back to meta tag scope when no query param exists
2. **Use `router.visit()` with scope** - Would require ensuring manifest loads properly
3. **Client-side scope detection** - More complex but would handle edge cases better

The chosen solution is minimal and follows the existing pattern used by `PWAScopedLink` components.