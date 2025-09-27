import Linkify from "linkify-react";

import AnnouncementForm from "~/components/AnnouncementForm";
import AppLayout from "~/components/AppLayout";
import { type Announcement } from "~/types";

export interface AnnouncementsPageProps extends SharedPageProps {}

const AnnouncementsPage: PageComponent<AnnouncementsPageProps> = () => {
  const { data } = useRouteSWR<{ recentAnnouncements: Announcement[] }>(
    routes.announcements.index,
    {
      descriptor: "load announcements",
    },
  );
  const { recentAnnouncements } = data ?? {};
  return (
    <Stack gap="xl">
      <AnnouncementForm />
      {!!recentAnnouncements && !isEmpty(recentAnnouncements) && (
        <Stack gap="sm">
          <Title order={2} size="h3" ta="center">
            recent announcements
          </Title>
          {recentAnnouncements.map(announcement => (
            <Card withBorder>
              <Card.Section inheritPadding withBorder py="sm">
                <Group justify="space-between">
                  <Time
                    format={DateTime.DATETIME_MED}
                    size="sm"
                    ff="heading"
                    fw={600}
                    tt="lowercase"
                  >
                    {announcement.created_at}
                  </Time>
                  <Badge
                    leftSection="to:"
                    styles={{
                      section: {
                        textTransform: "none",
                      },
                    }}
                    {...(announcement.test_recipient_phone_number && {
                      color: "yellow",
                    })}
                  >
                    {announcement.test_recipient_phone_number ?? "all users"}
                  </Badge>
                </Group>
              </Card.Section>
              <Card.Section
                inheritPadding
                withBorder
                py="sm"
                style={{ whiteSpace: "pre-wrap" }}
              >
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noopener noreferrer nofollow",
                    className: Anchor.classes.root,
                  }}
                >
                  {announcement.message}
                </Linkify>
              </Card.Section>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

AnnouncementsPage.layout = page => (
  <AppLayout<AnnouncementsPageProps>
    title="announcements"
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default AnnouncementsPage;
