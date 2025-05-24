import { randomId } from "@mantine/hooks";

import classes from "./VaulModalPortalTarget.module.css";

// In order to render portals inside Vaul, we have to get a little creative.
const VaulModalPortalTarget: FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const target = ref.current;
    if (target) {
      const modalId = randomId();
      startTransition(() => {
        openModal({
          modalId,
          portalProps: { target },
          children: <AutoCloseModalBody {...{ modalId }} />,
          style: { visibility: "hidden", pointerEvents: "none" },
        });
      });
    }
  }, []);
  return (
    <div
      {...{ ref }}
      className={classes.target}
      data-vaul-modal-portal-target
      data-vaul-no-drag
    />
  );
};

interface AutoCloseModalBodyProps {
  modalId: string;
}

const AutoCloseModalBody: FC<AutoCloseModalBodyProps> = ({ modalId }) => {
  useEffect(() => {
    closeModal(modalId);
  }, [modalId]);
  return null;
};

export default VaulModalPortalTarget;
