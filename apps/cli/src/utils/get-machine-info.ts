import os from "node:os";
export default () => {
  let operatingSystem;
  switch (os.platform()) {
    case "win32":
      operatingSystem = "Windows";
      break;
    case "darwin":
      operatingSystem = "MacOS";
      break;
    case "linux":
      operatingSystem = "Linux";
      break;
    default:
      operatingSystem = os.platform() || "Unknown";
      break;
  }
  return {
    os: operatingSystem,
    machine:os.hostname(),
    homedir: os.homedir(),
    user: os.userInfo().username,
  };
};
