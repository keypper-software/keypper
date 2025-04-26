import {
  COLOR_STYLE,
  COLOR_STYLE_TYPE,
  COLORS_TYPE,
} from "../constants/colors";
import { COLORS } from "../constants/colors";

interface Params {
  color?: COLORS_TYPE;
  style?: COLOR_STYLE_TYPE;
  text: any;
}
export default ({ color = "WHITE", style = "RESET", text }: Params):string => {
  const colorStyle = COLOR_STYLE[style];
  const textColor = COLORS[color];
  return `${colorStyle}${textColor}${text}`;
};
