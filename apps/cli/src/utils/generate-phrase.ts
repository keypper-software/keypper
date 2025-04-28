import { nanoid } from "nanoid";
import { generate } from "random-words";

interface Params {
  length: number;
  delimiter?: string;
}
// TODO [] Test the coliision prob; using this as a test case
export default ({ length, delimiter = "-" }: Params) => {
  const words = generate(length) as string[];
  words.push(nanoid(4));
  return words.join(delimiter);
};
