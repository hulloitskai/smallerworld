import {
  DARK_USER_THEMES,
  USER_THEME_BACKGROUND_COLORS,
  userThemeBackgroundVideoSrc,
  UserThemeContext,
} from "~/helpers/userThemes";
import { type UserTheme } from "~/types";

import classes from "./UserThemeProvider.module.css";

export interface UserThemeProviderProps extends PropsWithChildren {}

const UserThemeProvider: FC<UserThemeProviderProps> = ({ children }) => {
  const currentUser = useCurrentUser();
  const [overrideTheme, setOverrideTheme] = useState<
    UserTheme | null | undefined
  >();
  const appliedTheme =
    overrideTheme !== undefined ? overrideTheme : (currentUser?.theme ?? null);

  // == Set color scheme
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  useEffect(() => {
    if (appliedTheme) {
      const isDark = DARK_USER_THEMES.includes(appliedTheme);
      setColorScheme(isDark ? "dark" : "light");
    } else {
      clearColorScheme();
    }
  }, [appliedTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UserThemeContext.Provider
      value={{
        theme: appliedTheme,
        setOverrideTheme,
        clearOverrideTheme: () => setOverrideTheme(undefined),
      }}
    >
      {!!appliedTheme && (
        <div
          className={classes.backdrop}
          role="backdrop"
          style={{
            backgroundImage: `url(${userThemeBackgroundVideoSrc(appliedTheme)})`,
            backgroundColor: USER_THEME_BACKGROUND_COLORS[appliedTheme],
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            src={userThemeBackgroundVideoSrc(appliedTheme)}
          />
        </div>
      )}
      {children}
    </UserThemeContext.Provider>
  );
};

export default UserThemeProvider;
