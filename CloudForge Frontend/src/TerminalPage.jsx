import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "./TerminalPage.css";

const TerminalPage = () => {
  const terminalRef = useRef(null);
  const xterm = useRef(null);

  useEffect(() => {
    xterm.current = new Terminal({
      rows: 20,
      cols: 80,
      theme: {
        background: "#1e1e1e",
        foreground: "#dcdcdc",
      },
    });
    xterm.current.open(terminalRef.current);

    xterm.current.write("Welcome to the Linux Terminal!\r\n$ ");
    xterm.current.onKey(({ key, domEvent }) => {
      const charCode = domEvent.keyCode || domEvent.which;

      if (charCode === 13) {
        xterm.current.write("\r\n$ ");
      } else if (charCode === 8) {

        const currentText = xterm.current.buffer.active.getLine(
          xterm.current.buffer.active.cursorY
        )?.translateToString(false);
        if (currentText && currentText.length > 2) {
          xterm.current.write("\b \b");
        }
      } else {
        xterm.current.write(key);
      }
    });
  }, []);

  return (
    <div className="terminal-page">
      <div className="terminal-container" ref={terminalRef}></div>
    </div>
  );
};

export default TerminalPage;
