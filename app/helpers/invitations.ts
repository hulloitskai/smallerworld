import { type Invitation } from "~/types";

const INVITE_MESSAGE =
  "you're invited to join my smaller world (a secret blog just for friends)";

export const formatInvitationMessage = (invitationUrl: string): string =>
  `${INVITE_MESSAGE}: ${invitationUrl}`;

export const useInvitationMessage = (
  invitation: Invitation,
): string | undefined => {
  const [invitationMessage, setInvitationMessage] = useState<string>();
  useEffect(() => {
    const invitePath = routes.invitations.show.path({ id: invitation.id });
    const inviteUrl = normalizeUrl(invitePath);
    setInvitationMessage(formatInvitationMessage(inviteUrl));
  }, [invitation.id]);
  return invitationMessage;
};

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
      text: formatInvitationMessage(invitationUrl),
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
