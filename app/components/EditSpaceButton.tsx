import { type ButtonProps } from "@mantine/core";

import { isHotwireNative } from "~/helpers/hotwire";
import { usePageDialogOpened } from "~/helpers/pageDialog";

import DrawerModal from "./DrawerModal";
import EditSpaceForm, { type EditSpaceFormProps } from "./EditSpaceForm";

export interface EditSpaceButtonProps
  extends Pick<EditSpaceFormProps, "space" | "onSpaceUpdated">,
    Omit<ButtonProps, "children"> {}

const EditSpaceButton: FC<EditSpaceButtonProps> = ({
  space,
  onSpaceUpdated,
  className,
  ...otherProps
}) => {
  const [drawerModalOpened, setDrawerModalOpened] = useState(false);
  usePageDialogOpened(drawerModalOpened);
  return (
    <>
      <Button
        leftSection={<EditIcon />}
        className={cn("EditSpaceButton", className)}
        onClick={() => {
          if (isHotwireNative()) {
            router.visit(
              routes.userSpaces.edit.path({ id: space.friendly_id }),
            );
          } else {
            setDrawerModalOpened(true);
          }
        }}
        data-controller="button-bridge"
        data-bridge-title="edit"
        {...otherProps}
      >
        edit space
      </Button>
      <DrawerModal
        title="edit space"
        opened={drawerModalOpened}
        onClose={() => {
          setDrawerModalOpened(false);
        }}
      >
        <EditSpaceForm
          space={space}
          onSpaceUpdated={space => {
            setDrawerModalOpened(false);
            onSpaceUpdated?.(space);
          }}
        />
      </DrawerModal>
    </>
  );
};

export default EditSpaceButton;
