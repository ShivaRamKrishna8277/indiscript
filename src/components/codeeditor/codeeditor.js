import React, { useState } from "react";
import "./codeeditor.css";
import { runner } from "../../scripts/compile";

const Codeeditor = () => {
  const [language, setLanguage] = useState("kannada");
  const [code, setCode] = useState("");

  // Switch language function
  const handleLanguageSwitch = (lang) => {
    setLanguage(lang);
  };

  // Handle code changes in the editor
  const handleEditorChange = (e) => {
    setCode(e.target.value); // Update the state with the text entered in the textarea
  };

  // Execute code and print it to the console
  const executeCode = () => {
    const output = runner(code, language); // Get the output from the runner
    const outputBox = document.getElementById("outputArea");
    outputBox.innerHTML = `<pre>${output}</pre>`; // Display the output
  };

  return (
    <div id="editorWrapper">
      <h2 style={{ opacity: ".5", marginBottom: "20px", textAlign: "center" }}>
        CODE EDITOR
      </h2>
      <div
        style={{
          margin: "20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div id="langBtnContainer">
          <button
            onClick={() => handleLanguageSwitch("kannada")}
            className={language === "kannada" ? "activeLanguage" : ""}
          >
            Kannada
          </button>
          <button
            onClick={() => handleLanguageSwitch("sanskrit")}
            className={language === "sanskrit" ? "activeLanguage" : ""}
          >
            Sanskrit
          </button>
        </div>
        <div>
          <button
            style={{ backgroundColor: "#0E7500" }}
            id="runButton"
            onClick={executeCode}
          >
            Run Code
          </button>
        </div>
      </div>

      <div>
        <textarea
          className="codeEditor"
          placeholder="Write your code here"
          spellCheck="false"
          value={code}
          onChange={handleEditorChange}
        ></textarea>
        <hr
          style={{ marginTop: "10px", marginBottom: "10px", opacity: ".5" }}
        />
        <div id="outputBox">
          <p style={{ opacity: ".3" }}>Output:</p>
          <div
            id="outputArea"
            style={{ paddingTop: "10px", fontSize: "20px", lineHeight: "30px" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Codeeditor;
