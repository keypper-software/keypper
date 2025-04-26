export const COLORS = {
  BLACK: "\x1b[30m",
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MANGETA: "\x1b[35m",
  CYAN: "\x1b[36m",
  WHITE: "\x1b[37m",
};
export type COLORS_TYPE = keyof typeof COLORS;

export const BG = {
  BG_BLACK: "\x1b[40m",
  BG_RED: "\x1b[41m",
  BG_GREEN: "\x1b[42m",
  BG_YELLOW: "\x1b[43m",
  BG_BLUE: "\x1b[44m",
  BG_MANGENTA: "\x1b[45m",
  GB_CYAN: "\x1b[46m",
  BG_WHITE: "\x1b[47m",
};
export type BG_TYPE = keyof typeof BG;

export const COLOR_STYLE = {
  RESET: "\x1b[0m",
  BRIGHT: "\x1b[1m",
  DIM: "\x1b[2m",
  UNDERSCORE: "\x1b[4m",
  BLINK: "\x1b[5m",
  REVERSE: "\x1b[7m",
  HIDDEN: "\x1b[8m",
};

export type COLOR_STYLE_TYPE = keyof typeof COLOR_STYLE;
