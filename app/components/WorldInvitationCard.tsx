import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";

import MenuIcon from "~icons/heroicons/ellipsis-vertical-20-solid";

import { type Activity, type WorldInvitation } from "~/types";

import EditInvitationDrawer from "./EditInvitationDrawer";

import classes from "./WorldInvitationCard.module.css";

export interface WorldInvitationCardProps {
  activitiesById: Record<string, Activity>;
  invitation: WorldInvitation;
}

const WorldInvitationCard: FC<WorldInvitationCardProps> = ({
  activitiesById,
  invitation,
}) => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  // == Activities drawer
  const offeredActivities = useMemo(() => {
    const activities: Activity[] = [];
    invitation.offered_activity_ids.forEach(activityId => {
      const activity = activitiesById[activityId];
      if (activity) {
        activities.push(activity);
      }
    });
    return activities;
  }, [activitiesById, invitation.offered_activity_ids]);

  // == Remove invitation
  const { trigger: deleteInvitation, mutating: deletingInvitation } =
    useRouteMutation(routes.worldInvitations.destroy, {
      params: {
        id: invitation.id,
      },
      descriptor: "cancel invitation",
      onSuccess: () => {
        toast.success("invitation cancelled");
        void mutateRoute(routes.worldInvitations.index);
      },
    });

  return (
    <>
      <Card className={cn("WorldInvitationCard", classes.card)} withBorder>
        <Stack gap={4}>
          <Group
            gap={6}
            align="start"
            justify="space-between"
            className={classes.group}
          >
            <Group align="start" gap={8} style={{ flexGrow: 1 }}>
              {!!invitation.invitee_emoji && (
                <Box className={classes.emoji}>{invitation.invitee_emoji}</Box>
              )}
              <Text ff="heading" fw={600} lh={1.2}>
                {invitation.invitee_name}
              </Text>
            </Group>
            <Group gap={2} miw={0} style={{ flexShrink: 1 }}>
              <Text size="xs" c="dimmed">
                invited on{" "}
                <Time inherit format={DateTime.DATETIME_MED} tt="lowercase">
                  {invitation.created_at}
                </Time>
              </Text>
              <Menu
                width={180}
                position="bottom-end"
                arrowOffset={16}
                trigger="click-hover"
                opened={menuOpened}
                onChange={setMenuOpened}
              >
                <Menu.Target>
                  <ActionIcon variant="subtle" size="compact-xs">
                    <MenuIcon />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<RemoveIcon />}
                    onClick={() => {
                      openConfirmModal({
                        title: "really cancel invitation?",
                        children: <>you can't undo this action</>,
                        cancelProps: { variant: "light", color: "gray" },
                        groupProps: { gap: "xs" },
                        labels: {
                          confirm: "do it",
                          cancel: "wait nvm",
                        },
                        styles: {
                          header: {
                            minHeight: 0,
                            paddingBottom: 0,
                          },
                        },
                        onConfirm: () => {
                          void deleteInvitation();
                        },
                      });
                    }}
                  >
                    cancel invitation
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
          <Group gap={8} wrap="wrap">
            <Button
              leftSection={<InvitationIcon />}
              size="compact-xs"
              className={classes.detailsButton}
              onClick={() => {
                setDrawerOpened(true);
              }}
            >
              open invitation
            </Button>
            {!isEmpty(offeredActivities) && <Divider orientation="vertical" />}
            {offeredActivities.map(activity => (
              <Badge
                className={classes.activityBadge}
                key={activity.id}
                variant="default"
                leftSection={activity.emoji ?? <CouponIcon />}
              >
                {activity.name}
              </Badge>
            ))}
          </Group>
        </Stack>
        <LoadingOverlay
          visible={deletingInvitation}
          style={{ borderRadius: "var(--mantine-radius-default)" }}
        />
      </Card>
      <EditInvitationDrawer
        {...{ activitiesById, invitation }}
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
        }}
      />
    </>
  );
};

export default WorldInvitationCard;
