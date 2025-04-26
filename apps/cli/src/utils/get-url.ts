export default (url: string) => {
  return `${process.env.BASE_URL||""}${url.startsWith("/") ? url : "/" + url}`;
};
