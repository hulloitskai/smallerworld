import { type PageProps } from "@inertiajs/core";

import { type Friend, type PageCSRF, type User } from ".";

export default interface SharedPageProps extends PageProps {
  csrf: PageCSRF;
  flash: {
    notice?: string;
    alert?: string;
  };
  currentUser: User | null;
  currentFriend: Friend | null;
  isAdmin: boolean;
  faviconLinks: Record<string, string>[];
}
