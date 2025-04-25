import { type ImageProps } from "next/image";
import Link from "next/link";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const links = [
  {
    title: "Pricing",
    href: "/pricing",
  },
  {
    title: "Documentation",
    href: "/docs",
  },
];
export default function Home() {
  return (
    <div className="">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          fontSize: "13px",
          letterSpacing: "6px",
          fontFamily: "var(--font-geist-mono)",
        }}
      >
        <div className="">
          <img src="/logo/wordmark.png" width={200} alt="Keypper" />
          <p className="">DOCUMENTATION</p>
        </div>
      </div>
    </div>
  );
}
