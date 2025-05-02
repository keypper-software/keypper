import { BASE_URL } from "@/constants";

export default (url: string) => {
  return `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
};
