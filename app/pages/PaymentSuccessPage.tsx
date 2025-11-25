import { /* Loader, */ Text } from "@mantine/core";

import SmileIcon from "~icons/heroicons/face-smile";

import AppLayout from "~/components/AppLayout";
// import ContactLink from "~/components/ContactLink";
import { type User } from "~/types";

import classes from "./PaymentSuccessPage.module.css";

export interface PaymentSuccessPageProps extends SharedPageProps {
  currentUser: User;
}

const PaymentSuccessPage: PageComponent<PaymentSuccessPageProps> = () => {
  // const { data, error } = useRouteSWR<{
  //   membershipTier: "supporter" | "believer" | null;
  // }>(routes.memberships.activate, {
  //   descriptor: "activate membership",
  // });
  // const { membershipTier } = data ?? {};

  return (
    <Stack gap="lg" align="center">
      <Card withBorder>
        <Stack gap={6} align="center" ta="center">
          <Box component={SmileIcon} fz="xl" c="primary" />
          <Stack gap={2}>
            <Text ff="heading" fw={600}>
              thank you for supporting smaller world{" "}
              <span className={classes.heartEmoji}>❤️</span>
            </Text>
            <Text size="sm" c="dimmed" maw={340}>
              a team member will update your account membership shortly :)
            </Text>
          </Stack>
        </Stack>
        {/* {typeof membershipTier !== "undefined" ? (
          !membershipTier ? (
            <Stack align="center" gap={4} ta="center">
              <Text>failed to activate your membership :(</Text>
              <ContactLink
                type="sms"
                body="i couldn't activate my membership!"
                size="sm"
              >
                tell the developer!!
              </ContactLink>
            </Stack>
          ) : (
            <Stack align="center" gap="xs">
              <Text ta="center">
                welcome to the club!! you&apos;re a true {membershipTier} :)
              </Text>
              <Button
                component={Link}
                href={withTrailingSlash(routes.userWorld.show.path())}
                leftSection={<BackIcon />}
              >
                back to your world
              </Button>
            </Stack>
          )
        ) : (
          <Stack align="center" gap={4}>
            {error ? <AlertIcon /> : <Loader />}
            <Text size="sm" ff="heading">
              {error ? error.message : "activating your membership..."}
            </Text>
          </Stack>
        )} */}
      </Card>
      <Button
        component={Link}
        href={withTrailingSlash(routes.userWorld.show.path())}
        leftSection={<BackIcon />}
      >
        back to your world
      </Button>
    </Stack>
  );
};

PaymentSuccessPage.layout = page => (
  <AppLayout<PaymentSuccessPageProps>
    title="thank you for supporting smaller world <3"
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default PaymentSuccessPage;
