const INVITE_MESSAGE = "you're invited to join my smaller world";

export const formatInvitation = (invitationUrl: string): string =>
  `${INVITE_MESSAGE}: ${invitationUrl}`;

export const useInvitationShareData = (
  invitationUrl: string | undefined,
): ShareData | undefined =>
  useMemo(() => {
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
