import {
  Modal,
  type ModalProps,
  ScrollArea,
  type ScrollAreaAutosizeProps,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { InPortal, OutPortal } from "react-reverse-portal";

import { useHtmlPortalNode } from "~/helpers/react-reverse-portal";

import DrawerBase from "./DrawerBase";
import VaulPortalProvider from "./VaulPortalProvider";

import classes from "./DrawerModal.module.css";

export interface DrawerModalProps
  extends Pick<ModalProps, "title" | "opened" | "onClose" | "children"> {
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

  // == Vaul
  const [vaulPortalRoot, setVaulPortalRoot] = useState<
    HTMLDivElement | undefined
  >(undefined);

  // == Refs
  const isMobileSizeRef = useRef(isMobileSize);
  const openedRef = useRef(opened);
  isMobileSizeRef.current = isMobileSize;
  openedRef.current = opened;

  // == Prevent closing drawer when modals are open
  const { modals: openModals } = useModals();

  // == Modal
  const ModalScrollArea = useMemo(
    () =>
      forwardRef<HTMLDivElement, ScrollAreaAutosizeProps>((props, ref) => (
        <ScrollArea.Autosize
          {...{ ref, viewportRef }}
          scrollbars="y"
          offsetScrollbars="present"
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
      <DrawerBase
        {...{ title, setVaulPortalRoot }}
        opened={isMobileSize === true && opened}
        onClose={() => {
          if (isMobileSize === true && opened) {
            onClose();
          }
        }}
      >
        {contentPortalNode && <OutPortal node={contentPortalNode} />}
      </DrawerBase>
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
