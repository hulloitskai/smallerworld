import { Marquee } from "@gfazioli/mantine-marquee";
import {
  type BadgeProps,
  Code,
  Image,
  TableOfContents,
  Text,
} from "@mantine/core";

import activityCouponSrc from "~/assets/images/update1/activity-coupon.apng";
import activityCouponToFriendSrc from "~/assets/images/update1/activity-coupon-to-friend.png";
import anotherChanceSrc from "~/assets/images/update1/another-chance.apng";
import coverSrc from "~/assets/images/update1/cover.jpg";
import emojiReactSrc from "~/assets/images/update1/emoji-react.apng";
import enablePostSharingSrc from "~/assets/images/update1/enable-post-sharing.jpg";
import encouragementSrc from "~/assets/images/update1/encouragement.apng";
import installedSrc from "~/assets/images/update1/installed.jpg";
import irlCouponsSrc from "~/assets/images/update1/irl-coupons.mp4";
import nekoSrc from "~/assets/images/update1/neko.jpg";
import nekoFeedbackSrc from "~/assets/images/update1/neko-feedback.apng";
import newInviteSrc from "~/assets/images/update1/new-invite.jpg";
import noPetsPleaseSrc from "~/assets/images/update1/no-pets-please.jpg";
import pauseRemoveSrc from "~/assets/images/update1/pause-remove.apng";
import postVisibilitySrc from "~/assets/images/update1/post-visibility.apng";
import replyToPromptSrc from "~/assets/images/update1/reply-to-prompt.jpg";
import searchSrc from "~/assets/images/update1/search.apng";
import selectFriendsSrc from "~/assets/images/update1/select-friends.apng";
import sharePostButtonSrc from "~/assets/images/update1/share-post-button.png";
import textBlastSrc from "~/assets/images/update1/text-blast.png";
import textsOnlySrc from "~/assets/images/update1/texts-only.jpg";

import AppLayout from "~/components/AppLayout";
import ContactLink from "~/components/ContactLink";

import "@fontsource/jetbrains-mono";

import classes from "./Update1Page.module.css";
import "@gfazioli/mantine-marquee/styles.layer.css";

export interface Update1PageProps extends SharedPageProps {}

const Update1Page: PageComponent<Update1PageProps> = () => {
  return (
    <Stack data-breakout>
      <Marquee fadeEdges gap="lg" duration={60}>
        <StatsBadge>293 smaller worlds</StatsBadge>
        <StatsBadge>
          1,745 posts<span style={{ fontWeight: 400 }}> and </span>4,923 post
          reactions
        </StatsBadge>
        <StatsBadge tooltip="dms > comments fr">
          1,732 text replies
          <span style={{ fontWeight: 400 }}> to posts</span>
        </StatsBadge>
        <StatsBadge tooltip="加油!">
          419 encouragements
          <span style={{ fontWeight: 400 }}> sent between friends</span>
        </StatsBadge>
        <StatsBadge tooltip="peeps are legit reading your stuff!">
          16,382 post views
        </StatsBadge>
        <StatsBadge>
          962 lurkers
          <span style={{ fontWeight: 400 }}>
            {" "}
            quietly viewing posts in smaller worlds
          </span>
        </StatsBadge>
      </Marquee>
      <Stack gap={60} data-container>
        <Stack gap="xl">
          <Image src={coverSrc} />
          <Text>
            hi. first off - thanks for being a part of this journey with us - we{" "}
            <span style={{ fontFamily: "var(--font-family-emoji)" }}>❤️</span>{" "}
            you all.
            <br />
            <br />
            SO - we&apos;ve been talking with you, just trying to understand
            what you love about your smaller world, and what you wish could be
            improved. thanks for your honesty and time - those are two rare
            gifts we don&apos;t take for granted.
            <br />
            <br />
            we&apos;ve made this page to let you in on the new features and
            changes we been making, along with some of the existing things you
            may not have known about too! (kai is one sneaky dev).
            <br />
            <br />
            don&apos;t hesitate to reach out to us anytime with any feedback, or
            if you just want to chat :)
            <br />
            <Text inherit ta="end">
              — adam & kai
            </Text>
          </Text>
        </Stack>
        <Divider />
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={2}>your questions</Title>
            <Text>
              (p.s. <span className={classes.red}>*red*</span> = new features)
            </Text>
          </Group>
          <TableOfContents
            scrollSpyOptions={{ selector: "h3" }}
            minDepthToOffset={3}
            getControlProps={({ data, active }) => ({
              component: "a",
              href: "#" + data.id,
              style: {
                fontStyle: "italic",
                ...(active && {
                  backgroundColor: "var(--mantine-color-primary-filled)",
                }),
              },
              children: data.value,
            })}
          />
        </Stack>
        <Stack gap="lg">
          <Stack gap="xs" align="center">
            <Title order={3} className={classes.question} id="neko">
              &quot;who is neko?&quot;
            </Title>
            <Image
              src={nekoSrc}
              className={classes.nekoImage}
              onClick={() => {
                openModal({
                  title: "kai_neko_mama.mp4",
                  styles: {
                    title: {
                      fontFamily: "var(--mantine-font-family-monospace)",
                    },
                    body: {
                      padding: 0,
                    },
                  },
                  children: (
                    <video
                      src="https://tttkkdzhzvelxmbcqvlg.supabase.co/storage/v1/object/public/media/kainekomama.mp4"
                      autoPlay
                      playsInline
                      className={classes.modalVideo}
                    />
                  ),
                });
              }}
            />
          </Stack>
          <Stack gap={8} align="center">
            <Text maw={340} ta="center">
              say hi to Neko! he&apos;s our feedback cat. you can{" "}
              <span className={classes.red}>
                pet him anytime to give us some feedback or make a feature
                request
              </span>
              .
            </Text>
            <Image src={nekoFeedbackSrc} maw={180} />
          </Stack>
          <Stack gap={8} align="center">
            <Text ta="center">
              you can also opt to get rid of pets in your world as well.
            </Text>
            <Image src={noPetsPleaseSrc} maw={320} />
          </Stack>
        </Stack>
        <Stack gap={6} align="center">
          <Title order={3} className={classes.question} id="privacy">
            &quot;is my world actually private?&quot;
          </Title>
          <Text ta="center" maw={400}>
            yes! we have a new (and easy-to-read) terms of use & privacy policy:{" "}
            <Anchor href="https://smallerworld.club/policies" fw={600}>
              smallerworld.club/policies
            </Anchor>
          </Text>
        </Stack>
        <Stack gap={8} align="center">
          <Title
            order={3}
            className={classes.question}
            id="visibility-controls"
          >
            &quot;what if i don&apos;t want some people to see my post?&quot;
          </Title>
          <Stack>
            <Stack align="center" gap="xs">
              <Box maw={360} ta="center">
                <Title order={4} size="h5" td="underline">
                  post visibility settings
                </Title>
                <Text>
                  you can decide whether your post will be visible only to
                  friends, publicly available to anyone, or for your eyes only.
                </Text>
              </Box>
              <Image src={postVisibilitySrc} maw={200} />
            </Stack>
            <Stack gap={8} align="center">
              <Box maw={360} ta="center">
                <Title order={4} size="h5" td="underline">
                  select specific friends
                </Title>
                <Text>
                  you can individually select which specific friends you want to
                  see (or not see) your post.
                </Text>
              </Box>
              <Image src={selectFriendsSrc} maw={340} />
            </Stack>
            <Stack gap={8} align="center">
              <Box maw={360} ta="center">
                <Title order={4} size="h5" td="underline">
                  remove/pause a friend
                </Title>
                <Text>
                  if you&apos;d no longer like a friend to see your posts, you
                  can pause them; new posts you create will automatically be
                  hidden from them.
                  <br />
                  <span style={{ display: "block", marginTop: rem(3) }}>
                    you can also remove them to revoke their access to your
                    world.
                  </span>
                </Text>
              </Box>
              <Image src={pauseRemoveSrc} maw={300} />
            </Stack>
          </Stack>
        </Stack>
        <Stack gap={6} align="center">
          <Title
            order={3}
            className={classes.question}
            id="friends-not-reading"
          >
            &quot;i don&apos;t think my friends are seeing my posts&quot;
          </Title>
          <Title order={4} size="h5" td="underline" ta="center">
            did they install it?
          </Title>
          <Stack gap={8} align="center">
            <Stack align="center" gap={4}>
              <Text maw={360} ta="center">
                you can see if they&apos;ve installed your world
              </Text>
              <Image src={installedSrc} maw={300} />
            </Stack>
            <Stack align="center" gap={4}>
              <Text maw={360} ta="center">
                or if they&apos;ve{" "}
                <span className={classes.red}>
                  opted in to receive texts only
                </span>
              </Text>
              <Image src={textsOnlySrc} maw={300} />
            </Stack>
            <Stack align="center" gap={6}>
              <Text maw={400} ta="center" lh={1.3}>
                if they haven&apos;t done either (don&apos;t take it personally,
                peeps be busy), you can give them another chance
              </Text>
              <Image src={anotherChanceSrc} maw={300} />
            </Stack>
          </Stack>
        </Stack>
        <Stack gap={4} align="center">
          <Title
            order={3}
            className={classes.question}
            id="friend-notifications"
          >
            &quot;do my friends HAVE to activate notifications?&quot;
          </Title>
          <Stack gap="xs" align="center">
            <Text ta="center" maw={370}>
              nope. your friends can elect to{" "}
              <span className={classes.red}>receive text blasts</span> if they
              choose not to install your world
            </Text>
            <Image src={textBlastSrc} maw={300} />
          </Stack>
        </Stack>
        <Stack align="center" gap={4}>
          <Title order={3} className={classes.question} id="my-notifications">
            &quot;why should i enable notifications?&quot;
          </Title>
          <Stack>
            <Stack align="center" gap={6}>
              <Text maw={300} ta="center">
                so your friends can{" "}
                <span style={{ fontWeight: 600 }}>
                  send you encouragements and writing prompts
                </span>
              </Text>
              <Image src={encouragementSrc} maw={300} />
            </Stack>
            <Stack align="center" gap={6}>
              <Text maw={300} ta="center">
                and so you can get notified when they{" "}
                <span style={{ fontWeight: 600 }}>react to your posts</span>
              </Text>
              <Image src={emojiReactSrc} maw={270} />
            </Stack>
            <Text ta="center" maw={360}>
              are you having notification activation problems?{" "}
              <ContactLink
                type="sms"
                body="help! i'm not getting notifications on smaller world!"
                fw={600}
              >
                message us
              </ContactLink>{" "}
              and we&apos;ll help you fix it :)
            </Text>
          </Stack>
        </Stack>
        <Stack gap={8} align="center">
          <Title
            order={3}
            className={classes.question}
            maw={410}
            lh={1.25}
            id="friends-not-installing"
          >
            &quot;i&apos;ve invited my friends, but they&apos;re not downloading
            my world.&quot;
          </Title>
          <Stack align="center">
            <Stack align="center" gap={6}>
              <Text maw={300} ta="center">
                give them another chance!
              </Text>
              <Image src={anotherChanceSrc} maw={300} />
              <Text ta="center" maw={360}>
                there are a few steps to downloading your world, and sometimes
                people don&apos;t finish the process (who HASN&apos;T forgotten
                to open a random link their friend sent them?).
              </Text>
              <Text ta="center" maw={360}>
                try giving them another chance by re-sending the invite link.
                (Adam likes to send attach personal voice notes along with his).
              </Text>
            </Stack>
            <Stack align="center" gap={6}>
              <Text maw={300} ta="center">
                we&apos;ve also{" "}
                <span className={classes.red}>
                  upgraded the invite process.
                </span>{" "}
              </Text>
              <Image src={newInviteSrc} maw={300} />
              <Text ta="center" maw={400}>
                your invites now{" "}
                <span className={classes.red}>
                  include your most recent post
                </span>
                , so your friend can get a taste of what your world is about.
              </Text>
            </Stack>
            <Stack align="center" gap={6}>
              <Text ta="center" maw={420}>
                it also gives them the option to{" "}
                <span className={classes.red}>get your posts as texts</span>{" "}
                instead of installing your world.
              </Text>
              <Image src={textBlastSrc} maw={300} />
            </Stack>
            <Stack align="center" gap="xs">
              <Stack maw={360} ta="center" gap={4}>
                <Title
                  order={4}
                  size="h5"
                  td="underline"
                  className={classes.red}
                >
                  friendship activity coupons
                </Title>
                <Text>
                  you can now send an &quot;activity coupon&quot; along with
                  your invite—a little nudge to encourage your friend to do
                  stuff with you irl :)
                </Text>
              </Stack>
              <Image src={activityCouponSrc} maw={300} />
            </Stack>
          </Stack>
        </Stack>
        <Stack gap={4} align="center">
          <Title order={3} className={classes.question} id="sharing">
            &quot;can my friends share my posts?&quot;
          </Title>
          <Stack>
            <Stack align="center" gap={6}>
              <Text ta="center">
                yes, you can now allow your friends to share your posts.
              </Text>
              <Image src={enablePostSharingSrc} maw={340} />
            </Stack>
            <Stack align="center" gap={6}>
              <Text ta="center" maw={400}>
                when you enable this setting, your friends can use the share
                button to share your posts with other friends.
              </Text>
              <Image src={sharePostButtonSrc} maw={300} />
            </Stack>
            <Text ta="center" maw={400}>
              why would you want to do this?
              <br />
              for example: adam has a squad where they like to chat about each
              other&apos;s smaller world posts as a group - so they turn on this
              setting so they can comment on each other&apos;s posts in their
              group chat!
            </Text>
          </Stack>
        </Stack>
        <Stack gap={4} align="center">
          <Title
            order={3}
            className={classes.question}
            maw={380}
            lh={1.25}
            id="activity-coupons"
          >
            &quot;FRIENDSHIP ACTIVITY COUPONS? what are those?&quot;
          </Title>
          <Stack>
            <Stack gap={6} align="center">
              <Text ta="center" maw={440}>
                you can now send a friend invite with an{" "}
                <span className={classes.red}>&quot;activity coupon&quot;</span>
                , which is an offer from you to do a specific activity with
                them.
              </Text>
              <Image src={activityCouponSrc} maw={300} />
            </Stack>
            <Stack gap={6} align="center">
              <Text ta="center" maw={360}>
                you can also send an activity coupon to your existing friends,
                just because :)
              </Text>
              <Image src={activityCouponToFriendSrc} maw={300} />
            </Stack>
            <Stack align="center" gap={8}>
              <Stack maw={360} align="center" gap={4}>
                <Title
                  order={4}
                  size="h5"
                  td="underline"
                  className={classes.red}
                >
                  IRL coupons
                </Title>
                <Text ta="center">
                  we&apos;ve also been making real life coupons as well!
                </Text>
                <video
                  src={irlCouponsSrc}
                  playsInline
                  controls
                  style={{ maxWidth: rem(300) }}
                />
              </Stack>
              <Text ta="center" maw={400}>
                useful as backup-birthday gifts, or fun activities to do with
                friends. also a great way make new friends.{" "}
              </Text>
              <Text ta="center" maw={400}>
                <Anchor
                  href="https://www.zeffy.com/en-CA/ticketing/sir-this-is-a-wendys-merch-shop"
                  fw={700}
                  underline="always"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  you can order your own custom ones here
                </Anchor>
                <br />
                (use code <Code>SMALLERWORLD10</Code> for 10% off)
              </Text>
            </Stack>
          </Stack>
        </Stack>
        <Stack gap={4} align="center">
          <Title order={3} className={classes.question} id="encouragements">
            &quot;i wish my friends would post more&quot;
          </Title>
          <Stack>
            <Stack gap={6} align="center">
              <Text ta="center">send them a nudge or prompt!</Text>
              <Image src={encouragementSrc} maw={280} />
            </Stack>
            <Stack gap={6} align="center">
              <Text ta="center" maw={320}>
                also,{" "}
                <span className={classes.red}>
                  did you know you can directly reply to nudges/prompts?
                </span>
              </Text>
              <Image src={replyToPromptSrc} maw={300} />
            </Stack>
          </Stack>
          <Text ta="center" maw={400} mt={8}>
            (nudges and prompts V2: we&apos;re currently expanding the
            possibilities with nudges and prompts, and{" "}
            <ContactLink
              type="sms"
              body="feedback on nudges and prompts: "
              fw={600}
            >
              we&apos;d love your feedback or input on it
            </ContactLink>
            .)
          </Text>
        </Stack>
        <Stack gap={4} align="center">
          <Title order={3} className={classes.question} id="search">
            &quot;i wrote a post a while back and I can&apos;t find it&quot;
          </Title>
          <Stack gap={6} align="center">
            <Text ta="center" maw={400}>
              we have a <span className={classes.red}>search function</span>{" "}
              that becomes available once you have more than 10 posts.
            </Text>
            <Image src={searchSrc} maw={300} />
          </Stack>
        </Stack>
        <Stack gap={8} align="center">
          <Title
            order={3}
            className={classes.question}
            maw={440}
            lh={1.25}
            id="posting-anxiety"
          >
            &quot;i think i wanna post but i don&apos;t know what to post
            about.&quot;
          </Title>
          <Text ta="center" maw={400}>
            some folks take some time to make their first post—some people have
            waited up to a month.
          </Text>
          <Text ta="center" maw={400}>
            for inspo on getting the ball rolling, you can see some of the
            public posts in the smaller universe:{" "}
            <Anchor
              href="https://smallerworld.club/universe"
              fw={600}
              target="_blank"
            >
              smallerworld.club/universe
            </Anchor>
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
};

Update1Page.layout = page => (
  <AppLayout<Update1PageProps>
    title="update 1"
    withContainer
    containerProps={{ size: "xs", strategy: "grid" }}
    withGutter
  >
    {page}
  </AppLayout>
);

export default Update1Page;

interface StatsBadgeProps extends BadgeProps {
  tooltip?: ReactNode;
}

const StatsBadge: FC<StatsBadgeProps> = ({
  tooltip,
  className,
  children,
  ...otherProps
}) => (
  <Tooltip
    label={tooltip}
    position="bottom"
    disabled={!tooltip}
    defaultOpened
    events={{ hover: false, focus: false, touch: false }}
    middlewares={{ shift: false }}
    withinPortal={false}
  >
    <Badge
      size="lg"
      className={cn(classes.statsBadge, className)}
      {...otherProps}
    >
      {children}
    </Badge>
  </Tooltip>
);
