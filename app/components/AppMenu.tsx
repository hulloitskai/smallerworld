import { type InertiaLinkProps } from "@inertiajs/react";
import { Image, Loader, type MenuItemProps, Text } from "@mantine/core";

import MenuIcon from "~icons/heroicons/bars-3-20-solid";
import LockIcon from "~icons/heroicons/lock-closed-20-solid";

import logoSrc from "~/assets/images/logo.png";

import { useContact } from "~/helpers/contact";

import classes from "./AppMenu.module.css";

export interface AppMenuProps
  extends BoxProps,
    Omit<ComponentPropsWithoutRef<"div">, "style" | "children" | "onChange"> {}

const AppMenu: FC<AppMenuProps> = ({ ...otherProps }) => {
  const currentUser = useCurrentUser();
  const [opened, setOpened] = useState(false);

  // == Link items
  interface MenuLinkProps
    extends MenuItemProps,
      Omit<InertiaLinkProps, "color" | "style"> {}
  const MenuLink: FC<MenuLinkProps> = props => (
    <Menu.Item component={Link} {...props} />
  );

  return (
    <Menu
      position="bottom-end"
      trigger="click-hover"
      closeDelay={200}
      {...{ opened }}
      onChange={setOpened}
      offset={4}
      width={220}
      arrowPosition="center"
      className={classes.menu}
      {...otherProps}
    >
      <Menu.Target>
        <Badge
          className={classes.target}
          variant="default"
          size="lg"
          leftSection={<MenuIcon />}
        >
          menu
        </Badge>
      </Menu.Target>
      <Menu.Dropdown>
        {currentUser ? (
          <>
            <MenuLink
              href={routes.world.show.path()}
              leftSection={<Image src={logoSrc} h="100%" w="unset" />}
            >
              your world
            </MenuLink>
            <MenuLink
              href={routes.friends.index.path()}
              leftSection={<FriendsIcon />}
            >
              your friends
            </MenuLink>
            <MenuLink
              href={routes.joinRequests.index.path()}
              leftSection={<JoinRequestsIcon />}
            >
              your join requests
            </MenuLink>
            <LogoutItem
              onClose={() => {
                setOpened(false);
              }}
            />
          </>
        ) : (
          <>
            <MenuLink
              href={routes.registration.new.path()}
              leftSection={<Image src={logoSrc} h="100%" w="unset" />}
            >
              create your world
            </MenuLink>
            <Menu.Item
              leftSection={<SignInIcon />}
              component={Link}
              href={routes.session.new.path()}
            >
              sign in
            </Menu.Item>
          </>
        )}
        <Menu.Divider />
        <ContactItem
          onClose={() => {
            setOpened(false);
          }}
        />
        <MenuLink href={routes.policies.show.path()} leftSection={<LockIcon />}>
          terms of use & privacy
        </MenuLink>
        <Menu.Divider />
        <ServerInfoItem />
      </Menu.Dropdown>
    </Menu>
  );
};

export default AppMenu;

interface LogoutItemProps extends BoxProps {
  onClose: () => void;
}

const LogoutItem: FC<LogoutItemProps> = ({ onClose, ...otherProps }) => {
  // == Logout
  const { trigger, mutating } = useRouteMutation(routes.sessions.destroy, {
    descriptor: "sign out",
    onSuccess: () => {
      // TODO: Remove after May 1st
      document.cookie =
        "supabase_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.visit(routes.landing.show.path());
      onClose();
    },
  });

  return (
    <Menu.Item
      pos="relative"
      leftSection={mutating ? <Loader size={12} /> : <SignOutIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        void trigger();
      }}
      {...otherProps}
    >
      sign out
    </Menu.Item>
  );
};

interface ContactItemProps extends BoxProps {
  onClose: () => void;
}

const ContactItem: FC<ContactItemProps> = ({ onClose, ...otherProps }) => {
  const [contact, { loading }] = useContact({
    type: "sms",
    body: "i'm contacting u about smaller world! my name is ",
    onTriggered: onClose,
  });

  return (
    <Menu.Item
      leftSection={loading ? <Loader size={12} /> : <SendIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        contact();
      }}
      {...otherProps}
    >
      contact the creator :)
    </Menu.Item>
  );
};

const ServerInfoItem: FC<BoxProps> = props => {
  const { data } = useRouteSWR<{ bootedAt: string }>(
    routes.healthcheckHealthchecks.check,
    {
      descriptor: "load server info",
    },
  );
  const { bootedAt } = data ?? {};

  return (
    <Menu.Item
      component="div"
      disabled
      className={classes.serverInfoItem}
      {...props}
    >
      server booted{" "}
      {bootedAt ? (
        <TimeAgo inherit>{bootedAt}</TimeAgo>
      ) : (
        <Skeleton
          display="inline-block"
          height="min-content"
          width="fit-content"
          lh={1}
          style={{ verticalAlign: "middle" }}
        >
          <Text span inherit inline display="inline-block">
            2 minutes ago
          </Text>
        </Skeleton>
      )}
    </Menu.Item>
  );
};
