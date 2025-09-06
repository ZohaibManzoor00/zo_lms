'use client'

import Editor from "@monaco-editor/react";

export default function TestingPage() {
  const currentCode = "print('Hello, world!')";
  const handleEditorDidMount = () => {};
  const handleEditorChange = () => {};
  const isInteractiveMode = false;

  return (
    <div className="h-screen w-full">
      <Editor
        width="100%"
        height="100%"
        defaultLanguage="python"
        value={currentCode}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: !isInteractiveMode,
          wordWrap: "on",
          folding: true,
          showFoldingControls: "always",
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>
  );
}
