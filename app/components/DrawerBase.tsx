import {
  CloseButton,
  Drawer as MantineDrawer,
  type ModalProps,
  Overlay,
  Text,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useDeferredValue } from "react";
import { Drawer as VaulDrawer } from "vaul";

import VaulModalPortalTarget from "./VaulModalPortalTarget";
import VaulPortalRoot from "./VaulPortalRoot";

import classes from "./DrawerBase.module.css";
import mantineClasses from "~/helpers/mantine.module.css";

export interface DrawerBaseProps
  extends Pick<
    ModalProps,
    "title" | "opened" | "onClose" | "onExitTransitionEnd" | "children"
  > {
  setVaulPortalRoot: (portalRoot: HTMLDivElement | undefined) => void;
  classNames?: {
    content?: string;
    header?: string;
    body?: string;
  };
}

const DrawerBase: FC<DrawerBaseProps> = ({
  classNames,
  title,
  children,
  opened,
  setVaulPortalRoot,
  onExitTransitionEnd,
  ...otherProps
}) => {
  // == Prevent closing drawer when modals are open
  const { modals: openModals } = useModals();
  const deferredOpenModals = useDeferredValue(openModals);

  return (
    <VaulDrawer.Root
      shouldScaleBackground
      disablePreventScroll
      repositionInputs={false}
      open={opened}
      onAnimationEnd={open => {
        if (onExitTransitionEnd && !open) {
          onExitTransitionEnd();
        }
      }}
      {...otherProps}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay
          className={Overlay.classes.root}
          style={{ backdropFilter: `blur(${rem(2)})` }}
        />
        <VaulDrawer.Content
          className={cn(classes.content, classNames?.content)}
          onEscapeKeyDown={event => {
            if (
              !isEmpty(deferredOpenModals) ||
              document.querySelector(".mantine-Menu-dropdown")
            ) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={event => {
            let node = event.target;
            if (node instanceof SVGElement) {
              node = node.parentElement;
            }
            while (node instanceof HTMLElement) {
              const { dataset } = node;
              if (dataset.portal || typeof dataset.sonnerToast === "string") {
                event.preventDefault();
                break;
              } else {
                node = node.parentElement;
              }
            }
          }}
          aria-describedby={undefined}
          {...(!isEmpty(deferredOpenModals) && {
            style: {
              pointerEvents: "none",
            },
          })}
        >
          <VaulModalPortalTarget />
          <VaulPortalRoot
            onMounted={portalRoot => {
              setVaulPortalRoot(portalRoot);
            }}
            onUnmounted={() => {
              setVaulPortalRoot(undefined);
            }}
          />
          <div className={classes.viewport}>
            <Box
              component="header"
              className={cn(
                MantineDrawer.classes.header,
                mantineClasses.drawerHeader,
                classes.header,
              )}
              mod={{ "with-title": !!title }}
            >
              {!!title && (
                <Text
                  component={VaulDrawer.Title}
                  className={MantineDrawer.classes.title}
                  style={({ headings: { sizes, ...style } }) => ({
                    ...sizes.h4,
                    ...style,
                  })}
                >
                  {title}
                </Text>
              )}
              <CloseButton component={VaulDrawer.Close} />
            </Box>
            {!!children && (
              <div className={cn(classes.body, classNames?.body)}>
                {children}
              </div>
            )}
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
};

export default DrawerBase;
