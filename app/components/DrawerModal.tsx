import {
  CloseButton,
  Drawer,
  Modal,
  type ModalProps,
  Overlay,
  ScrollArea,
  type ScrollAreaAutosizeProps,
  Text,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useDeferredValue } from "react";
import { InPortal, OutPortal } from "react-reverse-portal";
import { Drawer as VaulDrawer } from "vaul";

import { useHtmlPortalNode } from "~/helpers/react-reverse-portal";

import VaulModalPortalTarget from "./VaulModalPortalTarget";
import VaulPortalProvider from "./VaulPortalProvider";
import VaulPortalRoot from "./VaulPortalRoot";

import classes from "./DrawerModal.module.css";
import mantineClasses from "~/helpers/mantine.module.css";

export interface DrawerModalProps
  extends Required<
    Pick<ModalProps, "title" | "opened" | "onClose" | "children">
  > {
  contentClassName?: string;
}

const DrawerModal: FC<DrawerModalProps> = ({
  contentClassName,
  title,
  opened,
  onClose,
  children,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentPortalNode = useHtmlPortalNode();
  const isMobileSize = useIsMobileSize();

  // == Refs
  const isMobileSizeRef = useRef(isMobileSize);
  const openedRef = useRef(opened);
  isMobileSizeRef.current = isMobileSize;
  openedRef.current = opened;

  // == Open modals
  const { modals: openModals } = useModals();
  const deferredOpenModals = useDeferredValue(openModals);

  // == Drawer
  const [vaulPortalRoot, setVaulPortalRoot] = useState<
    HTMLDivElement | undefined
  >();

  // == Modal
  const ModalScrollArea = useMemo(
    () =>
      forwardRef<HTMLDivElement, ScrollAreaAutosizeProps>((props, ref) => (
        <ScrollArea.Autosize
          {...{ ref, viewportRef }}
          scrollbars="y"
          classNames={{ viewport: classes.modalViewport }}
          {...props}
        />
      )),
    [],
  );

  return (
    <VaulPortalProvider portalRoot={vaulPortalRoot}>
      {contentPortalNode && (
        <InPortal node={contentPortalNode}>{children}</InPortal>
      )}
      <VaulDrawer.Root
        shouldScaleBackground
        disablePreventScroll
        repositionInputs={false}
        open={isMobileSize === true && opened}
        onClose={() => {
          if (isMobileSize === true && opened) {
            onClose();
          }
        }}
      >
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay
            className={Overlay.classes.root}
            style={{ backdropFilter: `blur(${rem(2)})` }}
          />
          <VaulDrawer.Content
            className={cn(contentClassName, classes.drawerContent)}
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
            <div ref={viewportRef} className={classes.drawerViewport}>
              <header
                className={cn(
                  Drawer.classes.header,
                  mantineClasses.drawerHeader,
                  classes.drawerHeader,
                )}
              >
                <Text
                  component={VaulDrawer.Title}
                  className={Drawer.classes.title}
                  style={({ headings: { sizes, ...style } }) => ({
                    ...sizes.h4,
                    ...style,
                  })}
                >
                  {title}
                </Text>
                <CloseButton component={VaulDrawer.Close} />
              </header>
              <div className={classes.drawerBody}>
                {contentPortalNode && <OutPortal node={contentPortalNode} />}
              </div>
            </div>
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
      <Modal
        classNames={{
          content: cn(contentClassName, classes.modalContent),
          header: classes.modalHeader,
        }}
        size="var(--container-size-xs)"
        scrollAreaComponent={ModalScrollArea}
        closeOnEscape={isEmpty(openModals)}
        {...{ title }}
        opened={isMobileSize === false && opened}
        onClose={() => {
          if (isMobileSize === false && opened) {
            onClose();
          }
        }}
      >
        {contentPortalNode && <OutPortal node={contentPortalNode} />}
      </Modal>
    </VaulPortalProvider>
  );
};

export default DrawerModal;
