import { type InertiaLinkProps } from "@inertiajs/react";
import { Loader, type MenuItemProps, Text } from "@mantine/core";

import MenuIcon from "~icons/heroicons/bars-3-20-solid";

import { useContact } from "~/helpers/contact";
import { createSupabaseClient } from "~/helpers/supabase";

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
    <Menu.Item component={Link} preserveScroll {...props} />
  );

  return (
    <Menu
      position="bottom-end"
      trigger="click-hover"
      closeDelay={200}
      {...{ opened }}
      onChange={setOpened}
      shadow="sm"
      offset={4}
      width={220}
      arrowPosition="center"
      withinPortal={false}
      classNames={{
        item: classes.item,
        itemSection: classes.itemSection,
        itemLabel: classes.itemLabel,
        dropdown: classes.dropdown,
      }}
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
            <MenuLink href={routes.home.show.path()} leftSection={<HomeIcon />}>
              home
            </MenuLink>
            <LogoutItem
              onClose={() => {
                setOpened(false);
              }}
            />
          </>
        ) : (
          <Menu.Item
            leftSection={<SignInIcon />}
            component={Link}
            href={routes.logins.new.path()}
          >
            sign in
          </Menu.Item>
        )}
        <Menu.Divider />
        <ContactItem
          onClose={() => {
            setOpened(false);
          }}
        />
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
  const [loading, setLoading] = useState(false);
  return (
    <Menu.Item
      pos="relative"
      leftSection={loading ? <Loader size={12} /> : <SignOutIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        const supabase = createSupabaseClient();
        setLoading(true);
        void supabase.auth.signOut().then(({ error }) => {
          setLoading(false);
          if (error) {
            toast.error("failed to sign out", { description: error.message });
          } else {
            onClose();
            router.visit(routes.landing.show.path());
          }
        });
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
    <Menu.Item component="div" disabled fz="xs" mod={{ info: true }} {...props}>
      Server booted{" "}
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
          <Text span inherit display="inline-block" lh={1}>
            2 minutes ago
          </Text>
        </Skeleton>
      )}
    </Menu.Item>
  );
};
