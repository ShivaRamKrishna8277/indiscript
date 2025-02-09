function lexer(input, language) {
  const keywords =
    language === "kannada"
      ? ["srsti", "mudrisu", "onduVele", "illadiddare"]
      : ["srsti", "mudran", "yadhi", "anyatha"];

  const tokens = [];
  let cursor = 0;

  const isAlphaNum = (char) => /[a-zA-Z0-9_]/.test(char); // No change needed
  const isOperator = (char) => /[+\-*%/=<>\!]/.test(char); // Fixed unnecessary escapes
  const isWhitespace = (char) => /\s/.test(char);

  while (cursor < input.length) {
    let char = input[cursor];

    if (isWhitespace(char)) {
      cursor++;
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let word = "";
      while (cursor < input.length && isAlphaNum(char)) {
        word += char;
        char = input[++cursor];
      }

      const type = keywords.includes(word) ? "keyword" : "identifier";
      tokens.push({ type, value: word });
      continue;
    }

    if (/\d/.test(char)) {
      let num = "";
      while (cursor < input.length && /\d/.test(char)) {
        num += char;
        char = input[++cursor];
      }
      tokens.push({ type: "number", value: parseInt(num, 10) });
      continue;
    }

    if (char === '"') {
      let str = "";
      char = input[++cursor];
      while (cursor < input.length && char !== '"') {
        str += char;
        char = input[++cursor];
      }
      if (char === '"') {
        cursor++; // Skip the closing quote
      } else {
        console.error("Unterminated string literal"); // Debugging log
      }
      tokens.push({ type: "string", value: str });
      continue;
    }

    if (isOperator(char)) {
      let operator = char;
      const nextChar = input[cursor + 1];
      if (char === "=" && nextChar === "=") operator = "==";
      else if (char === "!" && nextChar === "=") operator = "!=";
      else if (char === "<" && nextChar === "=") operator = "<=";
      else if (char === ">" && nextChar === "=") operator = ">=";

      if (operator.length > 1) cursor++;
      tokens.push({ type: "operator", value: operator });
      cursor++;
      continue;
    }

    if (["(", ")", "{", "}", ";"].includes(char)) {
      const type =
        char === "(" || char === ")"
          ? "paren"
          : char === "{" || char === "}"
          ? "brace"
          : "semicolon";
      tokens.push({ type, value: char });
      cursor++;
      continue;
    }

    console.error(`Unexpected character: ${char}`); // Debugging log
    cursor++;
  }

  return [tokens, keywords];
}

function parser(tokens, keywords) {
  const ast = {
    type: "Program",
    body: [],
  };

  while (tokens.length > 0) {
    let token = tokens.shift();

    if (token.type === "keyword" && token.value === keywords[0]) {
      // Handle variable declaration (srsti)
      if (tokens.length === 0) {
        throw new Error("Expected variable name after 'srsti'");
      }
      let declaration = {
        type: "Decleration",
        name: tokens.shift().value,
        value: null,
      };

      // Check for assignment
      if (
        tokens.length > 0 &&
        tokens[0].type === "operator" &&
        tokens[0].value === "="
      ) {
        tokens.shift(); // Consume '='
        let expression = "";
        while (
          tokens.length > 0 &&
          tokens[0].type !== "keyword" &&
          tokens[0].value !== "}"
        ) {
          expression += tokens.shift().value;
        }
        declaration.value = expression.trim();
      }
      ast.body.push(declaration);
    }

    if (token.type === "keyword" && token.value === keywords[1]) {
      // Handle print statement (mudrisu)
      if (tokens.length === 0) {
        throw new Error("Expected expression after 'mudrisu'");
      }
      let expression = tokens.shift().value;

      // If the expression is a string, handle it
      if (tokens.length > 0 && tokens[0].type === "string") {
        expression = tokens.shift().value;
      }

      ast.body.push({
        type: "Print",
        expression: expression,
      });
    }

    if (token.type === "keyword" && token.value === keywords[2]) {
      // Handle if statement (onduVele)
      if (tokens.length === 0 || tokens[0].value !== "(") {
        throw new Error("Expected '(' after 'onduVele'");
      }
      tokens.shift(); // Consume '('

      let condition = "";
      while (
        tokens.length > 0 &&
        (tokens[0].type !== "paren" || tokens[0].value !== ")")
      ) {
        condition += tokens.shift().value;
      }
      if (tokens.length === 0 || tokens[0].value !== ")") {
        throw new Error("Expected ')' after condition");
      }
      tokens.shift(); // Consume ')'

      if (tokens.length === 0 || tokens[0].value !== "{") {
        throw new Error("Expected '{' after condition");
      }
      tokens.shift(); // Consume '{'

      let body = [];
      while (tokens.length > 0 && tokens[0].value !== "}") {
        body.push(tokens.shift());
      }
      if (tokens.length === 0 || tokens[0].value !== "}") {
        throw new Error("Expected '}' after if body");
      }
      tokens.shift(); // Consume '}'

      // Check for else (illadiddare)
      let elseBody = null;
      if (
        tokens.length > 0 &&
        tokens[0].type === "keyword" &&
        tokens[0].value === keywords[3]
      ) {
        tokens.shift(); // Consume 'illadiddare'
        if (tokens.length === 0 || tokens[0].value !== "{") {
          throw new Error("Expected '{' after 'illadiddare'");
        }
        tokens.shift(); // Consume '{'
        elseBody = [];
        while (tokens.length > 0 && tokens[0].value !== "}") {
          elseBody.push(tokens.shift());
        }
        if (tokens.length === 0 || tokens[0].value !== "}") {
          throw new Error("Expected '}' after else body");
        }
        tokens.shift(); // Consume '}'
      }

      ast.body.push({
        type: "IfStatement",
        condition: condition.trim(),
        body: parser(body, keywords), // Recursively parse the body
        elseBody: elseBody ? parser(elseBody, keywords) : null, // Recursively parse the else body
      });
    }
  }

  return ast;
}

function codeGen(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGen).join("\n");
    case "Decleration":
      return `const ${node.name} = ${node.value};`;
    case "LetDecleration": // Handle let declarations in loops
      return `let ${node.name} = ${node.value};`;
    case "Print":
      return `console.log(${node.expression});`;
    case "IfStatement":
      return (
        `if (${node.condition}) {\n${codeGen(node.body)}\n}` +
        (node.elseBody ? ` else {\n${codeGen(node.elseBody)}\n}` : "")
      );
    default:
      throw new TypeError(`Unknown node type: ${node.type}`);
  }
}

function compiler(input, language) {
  const [tokens, keywords] = lexer(input, language);
  const ast = parser(tokens, keywords);
  const executableCode = codeGen(ast);
  return executableCode;
}

export function runner(input, language) {
  const executableCode = compiler(input, language);
  let output = "";

  const originalConsoleLog = console.log;
  console.log = (...args) => {
    output += args.join(" ") + "\n";
  };

  try {
    eval(executableCode);
  } catch (error) {
    output += `Error: ${error.message}\n`;
  } finally {
    console.log = originalConsoleLog;
  }

  return output.trim();
}
