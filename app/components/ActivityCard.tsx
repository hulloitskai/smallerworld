import { AspectRatio, Popover, Text } from "@mantine/core";

import AtIcon from "~icons/heroicons/at-symbol-20-solid";
import SetupIcon from "~icons/heroicons/cog-6-tooth-20-solid";

import { type Activity, type ActivityTemplate } from "~/types/generated";

import CreateActivityForm from "./CreateActivityForm";

import classes from "./ActivityCard.module.css";

export interface ActivityCardProps extends BoxProps {
  activityOrTemplate: Activity | ActivityTemplate;
  added: boolean;
  onChange: (activity: Activity | null) => void;
}

const ActivityCard: FC<ActivityCardProps> = ({
  activityOrTemplate,
  added,
  onChange,
  className,
  ...otherProps
}) => {
  const [activity, setActivity] = useState<Activity | null>(() =>
    "template_id" in activityOrTemplate ? activityOrTemplate : null,
  );
  const [popoverOpened, setPopoverOpened] = useState(false);
  const emoji = activity?.emoji ?? activityOrTemplate.emoji;
  return (
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
      <Popover
        width={370}
        shadow="md"
        disabled={!!activity}
        opened={popoverOpened}
        onChange={setPopoverOpened}
      >
        <Popover.Target>
          <Button
            size="compact-sm"
            variant={added ? "outline" : "light"}
            leftSection={
              added ? <SuccessIcon /> : activity ? <AddIcon /> : <SetupIcon />
            }
            {...(!activity && { disabled: popoverOpened })}
            onClick={() => {
              if (added) {
                onChange(null);
              } else if (activity) {
                onChange(activity);
              } else if (!popoverOpened) {
                setPopoverOpened(true);
              }
            }}
          >
            {added ? "coupon added" : "add coupon"}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="sm">
            <Stack gap="xs">
              <Title order={4} size="h5">
                configure activity
              </Title>
              <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
            </Stack>
            <CreateActivityForm
              template={activityOrTemplate}
              onCreated={activity => {
                setActivity(activity);
                onChange(activity);
              }}
            />
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Stack>
  );
};

export default ActivityCard;
