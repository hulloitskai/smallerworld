import { useShortlink } from "~/helpers/shortlinks";
import { type Invitation } from "~/types";

import PlainQRCode, { type PlainQRCodeProps } from "./PlainQRCode";

interface InvitationQRCodeProps extends Omit<PlainQRCodeProps, "value"> {
  invitation: Invitation;
}

const InvitationQRCode: FC<InvitationQRCodeProps> = ({ invitation }) => {
  const shortlink = useShortlink(
    () => routes.invitations.show.path({ id: invitation.id }),
    [invitation.id],
  );
  return <>{shortlink && <PlainQRCode value={shortlink} />}</>;
};

export default InvitationQRCode;
