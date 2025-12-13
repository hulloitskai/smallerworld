import { visit } from "@hotwired/turbo";
import { type InertiaLinkProps } from "@inertiajs/react";
import { Image, Loader, type MenuItemProps, Text } from "@mantine/core";

import MenuIcon from "~icons/heroicons/bars-3-20-solid";
import ChatIcon from "~icons/heroicons/chat-bubble-left-right-20-solid";
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

  const [loginPath, setLoginPath] = useState<string>(
    routes.sessions.new.path(),
  );
  useEffect(() => {
    setLoginPath(
      routes.sessions.new.path({
        query: {
          redirect_to: location.pathname + location.search,
        },
      }),
    );
  }, []);

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
          variant="default"
          size="lg"
          leftSection={<MenuIcon />}
          className={classes.target}
        >
          menu
        </Badge>
      </Menu.Target>
      <Menu.Dropdown>
        {currentUser ? (
          <>
            <LinkItem
              href={withTrailingSlash(routes.userWorld.show.path())}
              leftSection={<Image src={logoSrc} h="100%" w="unset" />}
            >
              your world
            </LinkItem>
            <LogoutItem
              onClose={() => {
                setOpened(false);
              }}
            />
          </>
        ) : (
          <>
            <LinkItem
              href={routes.registrations.new.path()}
              leftSection={<Image src={logoSrc} h="100%" w="unset" />}
            >
              create your world
            </LinkItem>
            <Menu.Item
              leftSection={<SignInIcon />}
              component={Link}
              href={loginPath}
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
        <LinkItem href={routes.policies.show.path()} leftSection={<LockIcon />}>
          terms of use & privacy
        </LinkItem>
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
      visit(routes.landing.show.path());
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
      leftSection={loading ? <Loader size={12} /> : <ChatIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        contact();
      }}
      {...otherProps}
    >
      contact the developer
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

interface LinkItemProps
  extends MenuItemProps,
    Omit<InertiaLinkProps, "color" | "style"> {}
const LinkItem: FC<LinkItemProps> = props => (
  <Menu.Item component={Link} {...props} />
);
