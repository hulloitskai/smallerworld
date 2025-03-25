import {
  type UserPageDialogState,
  UserPageDialogStateContext,
} from "~/helpers/userPages";

const UserPageDialogStateProvider = ({ children }: PropsWithChildren) => {
  const [opened, setOpened] = useState(false);
  const state = useMemo<UserPageDialogState>(
    () => ({ opened, setOpened }),
    [opened, setOpened],
  );
  return (
    <UserPageDialogStateContext.Provider value={state}>
      {children}
    </UserPageDialogStateContext.Provider>
  );
};

export default UserPageDialogStateProvider;
