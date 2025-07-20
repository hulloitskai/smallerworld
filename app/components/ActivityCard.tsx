import { AspectRatio, type ButtonProps, Modal, Text } from "@mantine/core";

import AtIcon from "~icons/heroicons/at-symbol-20-solid";
import SetupIcon from "~icons/heroicons/cog-6-tooth-20-solid";

import { type Activity, type ActivityTemplate } from "~/types/generated";

import CreateActivityForm from "./CreateActivityForm";

import classes from "./ActivityCard.module.css";

export interface ActivityCardProps
  extends BoxProps,
    Pick<ButtonProps, "loading"> {
  activityOrTemplate: Activity | ActivityTemplate;
  added: boolean;
  disableAdded?: boolean;
  addLabel?: ReactNode;
  addedLabel?: ReactNode;
  onChange: (activity: Activity | null) => void;
}

const ActivityCard: FC<ActivityCardProps> = ({
  activityOrTemplate,
  added,
  loading,
  disableAdded,
  addLabel,
  addedLabel,
  className,
  onChange,
  ...otherProps
}) => {
  const vaulPortalTarget = useVaulPortalTarget();
  const [activity, setActivity] = useState<Activity | null>(() =>
    "template_id" in activityOrTemplate ? activityOrTemplate : null,
  );
  const [drawerOpened, setDrawerOpened] = useState(false);
  const emoji = activity?.emoji ?? activityOrTemplate.emoji;
  return (
    <>
      <Stack
        className={cn("ActivityCard", className)}
        align="center"
        gap="sm"
        {...otherProps}
      >
        <AspectRatio ratio={512 / 262} className={classes.container}>
          <Box className={classes.stub}>
            <Card className={classes.card} withBorder>
              <Stack gap={0} justify="center" h="100%" ta="center">
                <Text className={classes.activityName} size="lg" c="black">
                  {activity?.name ?? activityOrTemplate.name}
                </Text>
                <Text
                  className={classes.activityDescription}
                  size="sm"
                  lineClamp={3}
                  ta="center"
                >
                  {activity?.description ?? activityOrTemplate.description}
                </Text>
                <Space h="xs" style={{ flexShrink: 1 }} />
              </Stack>
              {!!emoji && (
                <Badge
                  variant="default"
                  classNames={{
                    root: classes.cardBadge,
                    label: classes.emojiBadgeLabel,
                  }}
                  top={-12}
                >
                  {[...new Array(3)].map(() => emoji).join(" ")}
                </Badge>
              )}
              {!!activity?.location_name && (
                <Badge
                  variant="default"
                  classNames={{
                    root: classes.cardBadge,
                    label: classes.locationBadgeLabel,
                  }}
                  leftSection={<AtIcon />}
                  bottom={-12}
                  pl={6}
                >
                  {activity?.location_name}
                </Badge>
              )}
            </Card>
          </Box>
        </AspectRatio>
        <Button
          size="compact-sm"
          variant={added ? "outline" : "light"}
          {...{ loading }}
          leftSection={
            added ? <SuccessIcon /> : activity ? <AddIcon /> : <SetupIcon />
          }
          disabled={(added && !!disableAdded) || (!activity && drawerOpened)}
          onClick={() => {
            if (added) {
              onChange(null);
            } else if (activity) {
              onChange(activity);
            } else if (!drawerOpened) {
              setDrawerOpened(true);
            }
          }}
        >
          {added ? (addedLabel ?? "coupon added") : (addLabel ?? "add coupon")}
        </Button>
      </Stack>
      <Modal
        title="configure activity"
        portalProps={{ target: vaulPortalTarget }}
        opened={drawerOpened}
        data-disable-auto-fullscreen
        onClose={() => {
          setDrawerOpened(false);
        }}
      >
        <CreateActivityForm
          template={activityOrTemplate}
          onCreated={activity => {
            setActivity(activity);
            onChange(activity);
          }}
        />
      </Modal>
    </>
  );
};

export default ActivityCard;
