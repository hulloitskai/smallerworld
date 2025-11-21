import {
  type WorldPageDialogState,
  WorldPageDialogStateContext,
} from "~/helpers/worlds";

const WorldPageDialogStateProvider = ({ children }: PropsWithChildren) => {
  const [opened, setOpened] = useState(false);
  const state = useMemo<WorldPageDialogState>(
    () => ({ opened, setOpened }),
    [opened, setOpened],
  );
  return (
    <WorldPageDialogStateContext.Provider value={state}>
      {children}
    </WorldPageDialogStateContext.Provider>
  );
};

export default WorldPageDialogStateProvider;
