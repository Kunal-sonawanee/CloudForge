import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { loadPyodide } from "pyodide";
import TerminalPage from "./TerminalPage";
import "./styles.css";

const App = () => {
  const [code, setCode] = useState("// Write your code here...");
  const [output, setOutput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("dark");
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Pyodide is loading...");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

 
  const pyodideRef = useRef(null);

  // Initialize Pyodide once
  useEffect(() => {
    const initializePyodide = async () => {
      try {
        setLoadingMessage("IDE is loading...");
        pyodideRef.current = await loadPyodide();
        await pyodideRef.current.loadPackage(["micropip"]);
        setIsPyodideReady(true); // Mark Pyodide as ready
        setLoadingMessage(""); 
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        setLoadingMessage("Error loading Pyodide.");
      }
    };
    initializePyodide();
  }, []);

  // Update word count and line count on code change
  useEffect(() => {
    setWordCount(code.split(/\s+/).filter(Boolean).length); // Split by whitespace to count words
    setLineCount(code.split("\n").length); // Count lines by splitting at newline
  }, [code]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Handle terminal toggle
  const toggleTerminal = () => {
    setIsTerminalOpen((prev) => !prev);
  };

  const handleRun = async () => {
    try {
      let result = "";
      if (language === "javascript") {
        // Redirect console.log to capture the output
        const oldLog = console.log;
        let outputCapture = "";
        console.log = (message) => {
          outputCapture += message + "\n"; // Capture the log output
        };

        try {
          // Execute JavaScript code in a safe environment
          eval(code); 
          result = outputCapture; // Store the captured output
        } catch (error) {
          result = `JavaScript Error: ${error.message}`;
        }
        // Restore console.log to its original behavior
        console.log = oldLog;
      } else if (language === "python") {
        if (!isPyodideReady) {
          result = "Pyodide is still loading. Please wait...";
        } else {
          try {
            console.log("Running Python code...");
            result = await pyodideRef.current.runPythonAsync(code);
            console.log("Python code executed:", result);
          } catch (error) {
            console.error("Error executing Python code:", error);
            result = `Python Error: ${error.message}`;
          }
        }
      } else {
        result = "Language not supported for browser execution.";
      }

      // Ensure the result is defined and converted to string
      setOutput(
        result !== undefined && result !== null
          ? result.toString()
          : "No output generated"
      );
    } catch (error) {
      setOutput(`General Error: ${error.message}`);
    }
  };

  if (isTerminalOpen) {
    return <TerminalPage />;
  }

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <h1>CloudForge</h1>
        <button className="terminal-button" onClick={toggleTerminal}>
          Open Terminal
        </button>
      </header>
      <div className="language-selector">
        <label htmlFor="language">Select Language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      <div className="main-container">
        {/* Left - Code Editor */}
        <div className="editor-container">
          <MonacoEditor
            height="100%"
            defaultLanguage={language}
            defaultValue={code}
            theme={theme === "light" ? "vs" : "vs-dark"}
            onChange={(value) => setCode(value || "")}
          />
        </div>

        {/* Right - Output Section */}
        <div className="output-container">
          <h2>Output:</h2>
          <pre>
            {output || loadingMessage || "Your output will appear here..."}
          </pre>
        </div>
      </div>
      <div className="status-bar">
        <span>Words: {wordCount}</span>
        <span>Lines: {lineCount}</span>
      </div>
      <div className="run-button-container">
        <button className="run-button" onClick={handleRun}>
          Run Code
        </button>
      </div>

      {/* Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "🌞"}
      </button>
    </div>
  );
};

export default App;
