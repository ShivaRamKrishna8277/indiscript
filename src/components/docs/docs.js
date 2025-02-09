import React from "react";
import "./docs.css"

const keywords = [
  {
    kannada: "srsti (ಸೃಷ್ಟಿ)",
    sanskrit: "srsti (सृष्टि)",
    description: "Used to declare a variable.",
  },
  {
    kannada: "mudrisu (ಮುದ್ರಿಸು)",
    sanskrit: "mudran (मुद्रण)",
    description: "Defines a constant that cannot be changed.",
  },
  {
    kannada: "onduVele (ಒಂದು ವೇಳೆ)",
    sanskrit: "yadhi (यदि)",
    description: "Executes a block of code if a condition is true.",
  },
  {
    kannada: "illadiddare (ಇಲ್ಲದಿದ್ದರೆ)",
    sanskrit: "anyatha (अन्यथा)",
    description:
      "Executes one block if the condition is true and another if false.",
  },
];
const Docs = () => {
  return (
    <div id="docsContainer">
      <div className="table-container">
        <h2 style={{ opacity: ".5", marginBottom: "20px", textAlign: "center" }}>Documentation</h2>
        <table>
          <thead>
            <tr>
              <th>Kannada Keyword</th>
              <th>Sanskrit Keyword</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((keyword, index) => (
              <tr key={index}>
                <td>{keyword.kannada}</td>
                <td>{keyword.sanskrit}</td>
                <td>{keyword.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Docs;
