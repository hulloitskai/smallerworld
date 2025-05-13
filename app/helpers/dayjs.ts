import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

export const setupDayjs = (): void => {
  dayjs.extend(customParseFormat);
};
