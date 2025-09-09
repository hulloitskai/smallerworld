import { Text } from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import { useContact } from "~/helpers/contact";
import { queryParamsFromPath } from "~/helpers/inertia/routing";

import classes from "./PoliciesPage.module.css";

export interface PolicyPageProps extends SharedPageProps {}

const PolicyPage: PageComponent<PolicyPageProps> = () => {
  const [contact] = useContact();
  const [prevPageName, setPrevPageName] = useState<string | null>(null);
  useEffect(() => {
    const queryParams = queryParamsFromPath(location.href);
    if (history.length > 1 && queryParams.referrer) {
      setPrevPageName(queryParams.referrer);
    }
  }, []);
  return (
    <Stack gap="lg">
      <Transition transition="pop" mounted={!!prevPageName}>
        {transitionStyle => (
          <Button
            leftSection={<BackIcon />}
            onClick={() => {
              history.back();
            }}
            style={[{ alignSelf: "center" }, transitionStyle]}
          >
            back to {prevPageName}
          </Button>
        )}
      </Transition>
      <Box ta="center">
        <Title className={classes.title}>Terms of Use & Privacy Policy</Title>
        <Text size="sm" c="dimmed">
          Last updated: July 17, 2025
        </Text>
      </Box>
      <Group className={classes.explainer}>
        <Center style={{ flex: 1 }}>
          <Badge variant="default" size="lg">
            Spoken like a human bean{" "}
            <span style={{ marginLeft: rem(4) }}>🫘</span>
          </Badge>
        </Center>
        <Center style={{ flex: 1 }}>
          <Badge variant="default" size="lg">
            Legal Version <span style={{ marginLeft: rem(4) }}>⚖️</span>
          </Badge>
        </Center>
      </Group>
      <PolicySection
        friendlyContent={{
          title: "Welcome to Smaller World.",
          body: (
            <>
              This is your private space to share what matters — just with
              people you invite. By using our app, you agree to these terms.
            </>
          ),
        }}
        legalContent={{
          title: "Acceptance of Terms",
          body: (
            <>
              By accessing or using the Smaller World platform (&quot;the
              Service&quot;), you agree to be bound by these Terms of Service
              and our Privacy Policy. If you do not agree, do not use the
              Service.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "Your Stuff Is Yours.",
          body: (
            <>
              Everything you post stays private unless <i>you</i> choose to
              share it. We <b>don&apos;t read your posts</b>, and we&apos;ll{" "}
              <b>never tie your name or identity to what you write</b>. If we
              ever use data for research or to improve the app, we&apos;ll make
              sure it&apos;s fully anonymous — only computers will process it,
              not people.
            </>
          ),
        }}
        legalContent={{
          title: "User Content & Data Ownership",
          body: (
            <>
              Users retain full ownership of all content they post. Smaller
              World will not access or disclose user-generated content except as
              required by law or in cases of suspected abuse. We do not sell or
              share personally identifiable data. We may use anonymized,
              aggregated data for research, analytics, or business purposes. All
              such data is stripped of personally identifying information and
              processed in a way that prevents re-identification.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "We keep things minimal.",
          body: (
            <>
              We only collect what we need — your email, posts, and how you use
              the app (so we can improve it).
            </>
          ),
        }}
        legalContent={{
          title: "Data Collection",
          body: (
            <>
              We collect personal data including email addresses, user-generated
              content, and limited analytics data solely for the purpose of
              providing and improving the Service.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "You can leave anytime.",
          body: <>Delete your account and we&apos;ll delete your data.</>,
        }}
        legalContent={{
          title: "Account Termination",
          body: (
            <>
              Users may terminate their account at any time. Upon request,
              Smaller World will delete associated personal data in accordance
              with applicable data protection laws.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "We might message you.",
          body: (
            <>
              We&apos;ll sometimes send updates or announcements. You can opt
              out of most messages.
            </>
          ),
        }}
        legalContent={{
          title: "Communications",
          body: (
            <>
              By using the Service, you consent to receive service-related and
              promotional communications. You may opt out of promotional
              communications, but not essential updates related to account
              usage.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: <>Be kind. Don&apos;t spam. Don&apos;t be creepy.</>,
          body: (
            <>
              If someone&apos;s using the app in a harmful or exploitative way,
              we may suspend them.
            </>
          ),
        }}
        legalContent={{
          title: "Acceptable Use",
          body: (
            <>
              Users must not engage in abusive, harassing, unlawful, or
              disruptive behavior. Smaller World reserves the right to suspend
              or terminate access for users violating these terms.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "We do our best.",
          body: (
            <>
              Things may go wrong sometimes — bugs happen. Please use the app at
              your own risk.
            </>
          ),
        }}
        legalContent={{
          title: "Disclaimer of Warranty",
          body: (
            <>
              The Service is provided “as is.” Smaller World disclaims all
              warranties, express or implied. We are not liable for any damages
              resulting from the use of the platform.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "We might update this.",
          body: <>If something big changes, we&apos;ll let you know.</>,
        }}
        legalContent={{
          title: "Modifications",
          body: (
            <>
              We reserve the right to modify these terms at any time. Material
              changes will be communicated via email or in-app notification.
              Continued use constitutes acceptance.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "Where all this applies.",
          body: (
            <>
              If anything ever gets weird and legal, it&apos;ll be handled under
              Canadian law — more specifically, in Ontario.
            </>
          ),
        }}
        legalContent={{
          title: "Governing Law & Jurisdiction",
          body: (
            <>
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the Province of Ontario and the
              federal laws of Canada applicable therein, without regard to
              conflict of law principles. Any disputes arising from or relating
              to these Terms or the use of the Service shall be subject to the
              exclusive jurisdiction of the courts in Ontario, Canada.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "This might change someday.",
          body: (
            <>
              Right now, Ontario law applies. If Smaller World grows or moves,
              we might need to change our legal home — but we&apos;ll update you
              clearly if we do.
            </>
          ),
        }}
        legalContent={{
          title: "Change of Jurisdiction",
          body: (
            <>
              Smaller World is currently governed by the laws of Ontario,
              Canada. However, we reserve the right to update the governing
              jurisdiction if our legal or operational structure changes (e.g.,
              incorporation in another jurisdiction). Any such changes will be
              communicated to users in advance and reflected in the updated
              Terms of Service.
            </>
          ),
        }}
      />
      <PolicySection
        friendlyContent={{
          title: "Got questions?",
          body: (
            <Anchor
              component="button"
              onClick={() => {
                contact({ subject: "Terms of Use & Privacy Policy" });
              }}
            >
              Email us anytime.
            </Anchor>
          ),
        }}
        legalContent={{
          title: "Contact",
          body: (
            <>
              For questions regarding these terms or our privacy practices,{" "}
              <Anchor
                component="button"
                onClick={() => {
                  contact({ subject: "Terms of Use & Privacy Policy" });
                }}
              >
                please contact us by email.
              </Anchor>
            </>
          ),
        }}
      />
    </Stack>
  );
};

PolicyPage.layout = page => (
  <AppLayout<PolicyPageProps>
    withContainer
    containerProps={{ className: classes.container }}
    title="Terms of Use & Privacy Policy"
  >
    {page}
  </AppLayout>
);

export default PolicyPage;

interface SectionContent {
  title: ReactNode;
  body: ReactNode;
}

interface PolicySectionProps {
  friendlyContent: SectionContent;
  legalContent: SectionContent;
}

const PolicySection: FC<PolicySectionProps> = ({
  friendlyContent,
  legalContent,
}) => {
  return (
    <Card className={classes.policySectionCard} withBorder>
      <Group wrap="wrap" align="start">
        <ContentBlock content={friendlyContent} />
        <Divider
          label={
            <Group gap="xs">
              <Group gap={4}>
                <Box>⬆️</Box>
                <Box>simplified version</Box>
              </Group>
              <Box>/</Box>
              <Group gap={4}>
                <Box>legal version</Box>
                <Box>⬇️</Box>
              </Group>
            </Group>
          }
        />
        <ContentBlock content={legalContent} />
      </Group>
    </Card>
  );
};

interface ContentBlockProps {
  content: SectionContent;
}

const ContentBlock: FC<ContentBlockProps> = ({ content }) => {
  return (
    <Box className={classes.contentBlock}>
      <Title order={2} size="h4">
        {content.title}
      </Title>
      <Text component="div">{content.body}</Text>
    </Box>
  );
};
