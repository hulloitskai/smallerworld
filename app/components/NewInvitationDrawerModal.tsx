import { type DrawerProps, Image, Popover, Text } from "@mantine/core";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";

import { formatInvitationMessage } from "~/helpers/invitations";
import {
  messageUri,
  MESSAGING_PLATFORM_TO_ICON,
  MESSAGING_PLATFORM_TO_LABEL,
  MESSAGING_PLATFORMS,
} from "~/helpers/messaging";
import { type Invitation, type JoinRequest } from "~/types";

import DrawerModal from "./DrawerModal";
import EditInvitationForm from "./EditInvitationForm";
import InvitationQRCode from "./InvitationQRCode";
import NewInvitationForm, {
  type NewInvitationFormProps,
} from "./NewInvitationForm";
import SendInviteLinkButton from "./SendInviteLinkButton";

import classes from "./NewInvitationDrawerModal.module.css";

export interface NewInvitationDrawerModalProps
  extends Pick<DrawerProps, "opened" | "onClose">,
    Pick<NewInvitationFormProps, "fromJoinRequest" | "onInvitationCreated"> {}

const NewInvitationDrawerModal: FC<NewInvitationDrawerModalProps> = ({
  fromJoinRequest,
  onInvitationCreated,
  ...otherProps
}) => {
  const [revealBackToHomeButton, setRevealBackToHomeButton] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<
    Invitation | undefined
  >();

  return (
    <DrawerModal title="invite a friend to your world" {...otherProps}>
      <Stack>
        {createdInvitation ? (
          <EditInvitationForm invitation={createdInvitation} />
        ) : (
          <NewInvitationForm
            {...{ fromJoinRequest }}
            onInvitationCreated={invitation => {
              setCreatedInvitation(invitation);
              setTimeout(() => {
                setRevealBackToHomeButton(true);
              }, 3000);
              onInvitationCreated?.(invitation);
            }}
          />
        )}
        <Divider className={classes.divider} variant="dashed" />
        {createdInvitation ? (
          <Stack gap="lg" align="center">
            <Box ta="center">
              <Text size="md" ff="heading">
                {createdInvitation.invitee_name}&apos;s invite link
              </Text>
              <Text size="sm" c="dimmed" display="block">
                {fromJoinRequest ? (
                  <>send your friend the invite link!</>
                ) : (
                  <>
                    get your friend to scan this QR code,
                    <br />
                    or send them the link using the button below
                  </>
                )}
              </Text>
            </Box>
            <Stack gap="xs" align="center">
              {fromJoinRequest ? (
                <Stack gap={8} align="center">
                  <Image
                    src={bottomLeftArrowSrc}
                    className={classes.fromJoinRequestArrow}
                  />
                  <SendInviteLinkViaJoinRequestButton
                    invitation={createdInvitation}
                    joinRequest={fromJoinRequest}
                  />
                </Stack>
              ) : (
                <>
                  <InvitationQRCode invitation={createdInvitation} />
                  <Divider label="or" w="100%" maw={120} mx="auto" />
                  <Center>
                    <SendInviteLinkButton invitation={createdInvitation} />
                  </Center>
                </>
              )}
            </Stack>
            <Transition transition="fade-up" mounted={revealBackToHomeButton}>
              {transitionStyle => (
                <Button
                  component={Link}
                  href={withTrailingSlash(routes.userWorld.show.path())}
                  leftSection={<BackIcon />}
                  style={transitionStyle}
                >
                  back to your world
                </Button>
              )}
            </Transition>
          </Stack>
        ) : (
          <Box ta="center" mb="xs">
            <Title order={3} size="h6">
              how does this work?
            </Title>
            <Stack gap={4} maw={320} mx="auto" style={{ textWrap: "pretty" }}>
              <Text size="xs" c="dimmed">
                a unique invite link will be created for your friend. when they
                open it, they&apos;ll be prompted to add your world to their
                home screen! (no account required)
              </Text>
              <Text size="xs" c="dimmed">
                the name and emoji you set will be used to identify your friend
                when they react to your posts :)
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </DrawerModal>
  );
};

export default NewInvitationDrawerModal;

interface SendInviteLinkViaJoinRequestButtonProps {
  invitation: Invitation;
  joinRequest: JoinRequest;
}

const SendInviteLinkViaJoinRequestButton: FC<
  SendInviteLinkViaJoinRequestButtonProps
> = ({ invitation, joinRequest }) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const invitationUrl = useNormalizedUrl(
    () => routes.invitations.show.path({ id: invitation.id }),
    [invitation.id],
  );
  return (
    <Popover shadow="md" portalProps={{ target: vaulPortalTarget }}>
      <Popover.Target>
        <Button
          component="a"
          variant="filled"
          leftSection={<PhoneIcon />}
          mx="xs"
        >
          send invite link via...
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text ta="center" ff="heading" fw={500}>
            send via:
          </Text>
          <Group justify="center" gap="sm">
            {MESSAGING_PLATFORMS.map(platform => (
              <Stack key={platform} gap={2} align="center" miw={60}>
                <ActionIcon
                  component="a"
                  variant="light"
                  size="lg"
                  {...(invitationUrl
                    ? {
                        href: messageUri(
                          joinRequest.phone_number,
                          formatInvitationMessage(invitationUrl),
                          platform,
                        ),
                      }
                    : {
                        disabled: true,
                      })}
                >
                  <Box component={MESSAGING_PLATFORM_TO_ICON[platform]} />
                </ActionIcon>
                <Text size="xs" fw={500} ff="heading" c="dimmed">
                  {MESSAGING_PLATFORM_TO_LABEL[platform]}
                </Text>
              </Stack>
            ))}
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
