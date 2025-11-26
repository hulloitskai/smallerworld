import { type ButtonProps } from "@mantine/core";

import DrawerModal from "./DrawerModal";
import NewSpaceForm, { type NewSpaceFormProps } from "./NewSpaceForm";

export interface NewSpaceButtonProps
  extends Pick<NewSpaceFormProps, "onSpaceCreated">,
    Omit<ButtonProps, "children"> {}

const NewSpaceButton: FC<NewSpaceButtonProps> = ({
  onSpaceCreated,
  className,
  ...otherProps
}) => {
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);
  return (
    <>
      <Button
        leftSection={<AddIcon />}
        className={cn("NewSpaceButton", className)}
        onClick={() => {
          setDrawerModalOpened(true);
        }}
        {...otherProps}
      >
        create a space
      </Button>
      <DrawerModal
        title="new space"
        opened={drawerModalOpened}
        onClose={() => {
          setDrawerModalOpened(false);
        }}
      >
        <NewSpaceForm
          onSpaceCreated={space => {
            setDrawerModalOpened(false);
            onSpaceCreated?.(space);
          }}
        />
      </DrawerModal>
    </>
  );
};

export default NewSpaceButton;
