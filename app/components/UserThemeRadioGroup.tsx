import { Image, Radio, type RadioGroupProps } from "@mantine/core";

import NoneIcon from "~icons/heroicons/no-symbol-20-solid";

import { USER_THEMES, userThemeThumbnailSrc } from "~/helpers/userThemes";
import { type UserTheme } from "~/types";

import classes from "./UserThemeRadioGroup.module.css";

export interface UserThemeRadioGroupProps
  extends Omit<RadioGroupProps, "children"> {}

const UserThemeRadioGroup: FC<UserThemeRadioGroupProps> = props => (
  <Radio.Group label="your page theme" labelProps={{ mb: 8 }} {...props}>
    <Group justify="center" gap={6} wrap="wrap">
      <RadioCard theme={null} />
      {USER_THEMES.map(theme => (
        <RadioCard key={theme} {...{ theme }} />
      ))}
    </Group>
  </Radio.Group>
);

export default UserThemeRadioGroup;

interface RadioCardProps {
  theme: UserTheme | null;
}

const RadioCard: FC<RadioCardProps> = ({ theme }) => {
  return (
    <Radio.Card className={classes.radioCard} value={theme ?? ""}>
      {theme ? (
        <Image src={userThemeThumbnailSrc(theme)} />
      ) : (
        <Center className={classes.noTheme}>
          <Box component={NoneIcon} fz={24} c="dimmed" />
        </Center>
      )}
    </Radio.Card>
  );
};
