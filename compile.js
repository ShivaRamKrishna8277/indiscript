const language = "kannada";
const keywords = language === "kannada" ? ["srsti", "mudrisu", "onduVele", "illadiddare", "matte"] : ["srsti", "mudran", "yadhi", "anyatha", "punah"];

function lexer(input) {
  const tokens = [];
  let cursor = 0;

  const isAlphaNum = (char) => /[a-zA-Z0-9_]/.test(char);
  const isOperator = (char) => /[\+\-\*\%\/=<>!]/.test(char);
  const isWhitespace = (char) => /\s/.test(char);

  while (cursor < input.length) {
    let char = input[cursor];

    if (isWhitespace(char)) {
      cursor++;
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      // Match identifiers starting with _ or alphabets
      let word = "";
      while (isAlphaNum(char)) {
        word += char;
        char = input[++cursor];
      }

      const type = keywords.includes(word) ? "keyword" : "identifier";
      tokens.push({ type, value: word });
      continue;
    }

    if (/\d/.test(char)) {
      let num = "";
      while (/\d/.test(char)) {
        num += char;
        char = input[++cursor];
      }
      tokens.push({ type: "number", value: parseInt(num, 10) });
      continue;
    }

    if (char === '"') {
      // Match string literals
      let str = "";
      char = input[++cursor];
      while (char !== '"' && cursor < input.length) {
        str += char;
        char = input[++cursor];
      }
      tokens.push({ type: "string", value: str });
      cursor++; // Skip the closing quote
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

    console.error(`Unexpected character: ${char}`);
    cursor++;
  }

  return tokens;
}

function parser(tokens) {
  const ast = {
    type: "Program",
    body: [],
  };

  while (tokens.length > 0) {
    let token = tokens.shift();

    if (token.type === "keyword" && token.value === keywords[0]) {
      let declaration = {
        type: "Decleration",
        name: tokens.shift().value,
        value: null,
      };

      // check for assignment
      if (tokens[0].type === "operator" && tokens[0].value === "=") {
        tokens.shift();

        // parse the expression
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
      let expression = tokens.shift().value;

      // If the expression is a string, handle it
      if (tokens[0] && tokens[0].type === "string") {
        expression = tokens.shift().value;
      }

      ast.body.push({
        type: "Print",
        expression: expression,
      });
    }

    if (token.type === "keyword" && token.value === keywords[2]) {
      // Parse the condition inside parentheses
      tokens.shift(); // Skip '('
      let condition = "";
      while (tokens[0].type !== "paren" || tokens[0].value !== ")") {
        condition += tokens.shift().value;
      }
      tokens.shift(); // Skip ')'

      // Parse the body inside curly braces
      tokens.shift(); // Skip '{'
      let body = [];
      while (tokens.length > 0 && tokens[0].value !== "}") {
        body.push(tokens.shift());
      }
      tokens.shift(); // Skip '}'

      // Check for 'anyatha' (else)
      let elseBody = null;
      if (
        tokens.length > 0 &&
        tokens[0].type === "keyword" &&
        tokens[0].value === keywords[3]
      ) {
        tokens.shift(); // Skip 'anyatha'
        tokens.shift(); // Skip '{'
        elseBody = [];
        while (tokens.length > 0 && tokens[0].value !== "}") {
          elseBody.push(tokens.shift());
        }
        tokens.shift(); // Skip '}'
      }

      ast.body.push({
        type: "IfStatement",
        condition: condition.trim(),
        body: parser(body), // Recursively parse the body
        elseBody: elseBody ? parser(elseBody) : null, // Recursively parse the else body
      });
    }

    // Handle the "matte" (for loop)
    if (token.type === "keyword" && token.value === keywords[4]) {
      // Parse the parenthesis
      const parenOpen = tokens.shift();
      if (parenOpen.value !== "(")
        throw new Error("Expected '(' after 'matte'");

      // Parse initialization
      let initTokens = [];
      while (tokens.length && tokens[0].value !== ";") {
        initTokens.push(tokens.shift());
      }
      tokens.shift(); // Consume ';'

      // Parse condition
      let conditionTokens = [];
      while (tokens.length && tokens[0].value !== ";") {
        conditionTokens.push(tokens.shift());
      }
      tokens.shift(); // Consume ';'

      // Parse increment
      let incrementTokens = [];
      while (tokens.length && tokens[0].value !== ")") {
        incrementTokens.push(tokens.shift());
      }
      tokens.shift(); // Consume ')'

      // Parse body
      const braceOpen = tokens.shift();
      if (braceOpen && braceOpen.value !== "{")
        throw new Error("Expected '{' after for loop");
      let bodyTokens = [];
      while (tokens.length && tokens[0].value !== "}") {
        bodyTokens.push(tokens.shift());
      }
      tokens.shift(); // Consume '}'

      // Process initialization, condition, increment
      const initAst = parser(initTokens);
      let initNode = initAst.body[0];
      if (initNode?.type === "Decleration") initNode.type = "LetDecleration"; // Use 'let' for loop variables

      const condition = conditionTokens.map((t) => t.value).join("");
      const increment = incrementTokens.map((t) => t.value).join("");
      const bodyAst = parser(bodyTokens);

      ast.body.push({
        type: "ForStatement",
        init: initNode,
        condition,
        increment,
        body: bodyAst,
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
    case "ForStatement":
      const initCode = codeGen(node.init).replace(/;$/, ""); // Remove semicolon for for-loop syntax
      const bodyCode = codeGen(node.body);
      return `for (${initCode}; ${node.condition}; ${node.increment}) {\n${bodyCode}\n}`;
    default:
      throw new TypeError(`Unknown node type: ${node.type}`);
  }
}

function compiler(input) {
  const tokens = lexer(input);
  const ast = parser(tokens);
  const executableCode = codeGen(ast);
  return executableCode;
}

function runner(input) {
  eval(input);
}

const code = language === "kannada" ? `
    srsti x = 10
    srsti y = 20
    srsti sum = x + y
    mudrisu sum

    onduVele(x > y){
        mudrisu x
    } illadiddare {
        mudrisu y
    }

    matte (srsti i = 0; i < 5; i = i + 1) {
    mudrisu i
    }
`:`
    srsti x = 10
    srsti y = 20
    srsti sum = x + y
    mudran sum

    yadhi(x > y){
        mudran x
    } anyatha {
        mudran y
    }

    punah (srsti i = 0; i < 5; i = i + 1) {
    mudran i
    }
`;

const executable = compiler(code);
runner(executable);
