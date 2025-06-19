import DrawerBase, { type DrawerBaseProps } from "./DrawerBase";
import VaulPortalProvider from "./VaulPortalProvider";

export interface DrawerProps
  extends Omit<DrawerBaseProps, "setVaulPortalRoot"> {}

const Drawer: FC<DrawerProps> = ({ ...otherProps }) => {
  const [vaulPortalRoot, setVaulPortalRoot] = useState<
    HTMLDivElement | undefined
  >();
  return (
    <VaulPortalProvider portalRoot={vaulPortalRoot}>
      <DrawerBase {...{ setVaulPortalRoot }} {...otherProps} />
    </VaulPortalProvider>
  );
};

export default Drawer;
