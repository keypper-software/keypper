import storage from "./storage";

export type logsType = "error" | "warning";
interface getLogs {
  type: logsType;
  level?: number;
}

const logBuilder = async () => {
  const store = await storage();
  await store.initLogs();

  //   INTERNAL
  const generateLogsId = () => {};

  const addToLogs = () => {};

  const clearLogs = () => {};

  const getLogs = ({ type, level = 1 }: getLogs) => {};

  return {
    addToLogs,
    clearLogs,
    getLogs,
  };
};

export default logBuilder;
