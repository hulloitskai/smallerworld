import { hrefToUrl } from "@inertiajs/core";
import { useEffect, useState } from "react";

import { type Invitation } from "~/types";

import routes from "./routes";
import { shortlinkIfAvailable } from "./shortlinks";

export const formatInvitationMessage = (invitationUrl: string): string =>
  "here's an invitation to my smaller world (a secret blog just for friends)" +
  `: ${invitationUrl}`;

export const useInvitationShortlink = (
  invitation: Invitation,
): string | undefined => {
  const [shortlink, setShortlink] = useState<string>();
  useEffect(() => {
    const shortlink = invitationShortlink(invitation);
    setShortlink(shortlink);
  }, [invitation]);
  return shortlink;
};

export const useInvitationShareData = (
  invitation: Invitation,
): ShareData | undefined => {
  const [shareData, setShareData] = useState<ShareData>();
  useEffect(() => {
    const shortlink = invitationShortlink(invitation);
    setShareData({ text: formatInvitationMessage(shortlink) });
  }, [invitation]);
  return shareData;
};

const invitationShortlink = (invitation: Invitation): string => {
  const invitePath = routes.invitations.show.path({ id: invitation.id });
  const inviteUrl = hrefToUrl(invitePath);
  shortlinkIfAvailable(inviteUrl);
  return inviteUrl.toString();
};

export const prettyInviteeName = (
  invitation: Pick<Invitation, "invitee_emoji" | "invitee_name">,
): string => {
  const { invitee_emoji, invitee_name } = invitation;
  return [invitee_emoji, invitee_name].filter(Boolean).join(" ");
};
