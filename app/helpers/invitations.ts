import { type Invitation } from "~/types";

const INVITE_MESSAGE = "you're invited to join my smaller world";

export const formatInvitation = (invitationUrl: string): string =>
  `${INVITE_MESSAGE}: ${invitationUrl}`;

export const useInvitationShareData = (
  invitation: Invitation,
): ShareData | undefined => {
  const invitationUrl = useNormalizeUrl(
    () => routes.invitations.show.path({ id: invitation.id }),
    [invitation.id],
  );
  return useMemo(() => {
    if (!invitationUrl) {
      return;
    }
    const shareData: ShareData = {
      text: INVITE_MESSAGE,
      url: invitationUrl,
    };
    if (navigator.canShare(shareData)) {
      return shareData;
    }
  }, [invitationUrl]);
};

export const prettyInviteeName = (
  invitation: Pick<Invitation, "invitee_emoji" | "invitee_name">,
): string => {
  const { invitee_emoji, invitee_name } = invitation;
  return [invitee_emoji, invitee_name].filter(Boolean).join(" ");
};
