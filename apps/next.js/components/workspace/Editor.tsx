import { lazy, Suspense } from "react";
import rehypePrism from "rehype-prism-plus";

interface EditorProps {
  value: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  language?: string;
  placeholder?: string;
}

// Lazy load the CodeEditor component
const CodeEditor = lazy(() => import("@uiw/react-textarea-code-editor"));

const Editor = ({
  value,
  disabled = false,
  onChange,
  language = "js",
  placeholder = "Enter code here...",
}: EditorProps) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  if (typeof window === "undefined") {
    // Return a simple textarea when rendering on the server
    return (
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-full bg-transparent p-4 font-mono text-sm focus:outline-none"
      />
    );
  }

  return (
    <>
      <Suspense
        fallback={
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full h-full bg-transparent p-4 font-mono text-sm focus:outline-none"
          />
        }
      >
        <CodeEditor
          value={value}
          language={language}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(evt) => handleChange(evt.target.value)}
          padding={15}
          rehypePlugins={[
            [rehypePrism, { ignoreMissing: true, showLineNumbers: true }],
          ]}
          wrap="off"
          style={{
            fontSize: 16,
            backgroundColor: "transparent",
            height: "100%",
            width: "100%",
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </Suspense>
    </>
  );
};

export default Editor;
