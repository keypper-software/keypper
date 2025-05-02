import getColor, { GetColorParams } from "./get-color";

type LoggerParams = Omit<GetColorParams, "text">;
export default (text: string, opts: LoggerParams = { style: "RESET" }) => {
  console.log(getColor({ text, ...opts }));
};
