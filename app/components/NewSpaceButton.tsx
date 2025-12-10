import { type ButtonProps } from "@mantine/core";

import { isHotwireNative } from "~/helpers/hotwire";

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
        leftSection={<Box component={SpaceIcon} fz="sm" />}
        className={cn("NewSpaceButton", className)}
        onClick={() => {
          if (isHotwireNative()) {
            router.visit(routes.spaces.new.path());
          } else {
            setDrawerModalOpened(true);
          }
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
