import getColor from "@/utils/get-color";

export default async () => {
  try {
    console.log(
      getColor({
        text: "⚠️ You are already logged out",
        color: "YELLOW",
      })
    );
  } catch (error) {}
};
