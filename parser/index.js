import { _under, A, Z, isUpperCaseLetter } from "../lexer/constants.js";
import { TokenType } from "../tokens/tokens.js";

import { defaultTypes } from "../Types/default_types.js";

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.nextToken();

    this.ast = [];
    this.idx = 0;
    this.currentToken = 0; 
  }

  parse() {
    while(this.currentToken?.type !== "EOF") {
      switch(this.currentToken?.type) {
        case "Literal":
          if(this.peek()?.type === '->') {
            this.ast.push(this.Assignment());
          } 
          else {
            this.ast.push(this.Paragraph());
          }
          break;
        case "-":
          if(this.currentToken?.type === '-') {
            this.ast.push(this.Value())
            this.nextToken()
          }
          break;
        case "(":
          this.ast.push(this.PinFlag());
          break;
        // case "Literal":
        case "~":
        case "*":
        case "**":
          this.ast.push(this.Text());
          break;
        case "[":
          this.ast.push(this.Group());
          break;
        case "#":
          console.log("Defautlt Types not yet supported");
          break;
      }

      this.nextToken();
    }

    return this.ast
  }

  Group() {
    let Marks = [];
    let text = null;
    let context = "group"

    if (this.currentToken?.type === "[") {
      this.nextToken()
      text = this.Text();
      // this.consume("]", "it should be an close bracket");
    } 

    if (!text) {
      throw new SyntaxError("A group needs to have a name");
    }

    this.nextToken();

    term: while (this.currentToken?.type !== "Terminator") {
      if (this.currentToken?.type === "EOF") break term;

      switch (this.currentToken?.type) {
        case "(":
          Marks.push(this.PinFlag());
          break;
        case "Literal":
          if(this.peek()?.type === '->') {
            Marks.push(this.Assignment());
          } 
          else {
            Marks.push(this.Paragraph());
            if (this.currentToken?.type === "Terminator") break term;
          }
          break;
        case "~":
        case "*":
        case "**":
          Marks.push(this.Paragraph())
          break;
      }


      this.nextToken();
    }

    const value = {
      NodeType: 'Group',
      name: text,
      value: Marks
    }

    return value;

  }

  Assignment() {
    let text = this.ComposedText();

    if(this.peek()?.type === "->") {
      this.nextToken();
      let isVar = isUpperCaseLetter(this.peek()?.value)
        if(isVar) {
          this.nextToken();
          let value = {
            NodeType: 'Assignment',
            name: this.currentToken?.value,
            value: [text]
          }
          return value;
        } 
      // this should be a match/consume function.
      else if(this.peek()?.type !== "Literal") {
        throw new SyntaxError("Assignments should have a variable name");
      }
      else {
        throw new SyntaxError("A variable needs to be uppercased.");
      }
    }
  }

  PinFlag() {
    let ref = this.Reference();

    if(this.peek()?.type === "-") {
      this.nextToken();

      if(this.peek()?.type === "Literal"
      || this.peek()?.type === "*"
      || this.peek()?.type === "**"
      || this.peek()?.type === "~") { // this giant mess is just for testing purposes
        this.nextToken(); // i don't like it...
        let value = this.Value();

        let pinflag = { NodeType: 'PinFlag', ref: ref, value: value }
        return pinflag;
      }
    }

    return ref;
  }

  Reference() {
    if(this.currentToken?.type === '(') {
      this.nextToken();
      let text = this.ComposedText();

      if(!text) {
        throw new SyntaxError("Malformed Reference. Missing referenced variable");
      }

      let value = { NodeType: 'Reference', name: text }
      this.nextToken();
      return value; 
    }
  }

  // issue: 2
  Value() {
    let text = this.Text();
    let value = [text];

    while (this.peek()?.type === '|') {
      this.nextToken();
      value.push(this.Text());
      this.nextToken();
    }

    return { NodeType: 'Value', value };
  }


  Italic () {
    if (this.currentToken?.type === "*") {
      this.nextToken();
      let literal = this.ComposedText();

      this.consume("*", "It should be an italic `*`.");

      return {
        NodeType: 'Italic',
        value: literal
      } 
    }
  }

  Bold () {
    if (this.currentToken?.type === "**") {
      this.nextToken();
      let literal = this.ComposedText();

      this.consume("**", "It should be an bold `**`.");
      return {
        NodeType: 'Bold',
        value: literal
      } 
    }
  }

  LineThrough () {
    if (this.currentToken?.type === "~") {
      this.nextToken();
      let literal = this.ComposedText();

      this.consume("~", "It should be an Line Through `~`.");

      return {
        NodeType: 'LineThrough',
        value: literal
      } 
    }
  }

  Paragraph () {
    const child = []
    let ctx = "in";

    while (this.peek()?.type !== "Terminator") {
      if (this.currentToken?.type === "Terminator") break;
      else if (this.currentToken?.type === "EOF") break;

      switch (this.currentToken?.type) {
        case "Literal":
        case "*":
        case "**":
        case "~":
          child.push(this.TextF())
          break;
      }

      if (this.currentToken?.type === "LiteralEnd") break;


      this.nextToken();
    }

    return {
      NodeType: "Paragraph",
      children: child
    }
  }

  TextF() {
    let value = [];
    let ctx = "in";

    // just remove the loop and the if statement in order to work...oh poor frank.
      while (ctx === "in") {
      if (this.currentToken?.type === "NewLine" 
        || this.currentToken?.type === "EOF" 
      ) { break; };
    
      if (this.currentToken?.type === "LiteralEnd") {
        break;
      }

      switch (this.currentToken?.type) {
        case "*":
          value.push(this.Italic());
          break;
        case "**":
          value.push(this.Bold());
          break;
        case "~":
          value.push(this.LineThrough());
          break;
        case "Literal":
          value.push({
            NodeType: 'Text',
            value: this.currentToken?.value
          });
          break;
        }

      this.nextToken();
    }

    return {
      NodeType: "ComposedText",
      children: value,
    };
  }

  Text() {
    let value = [];
    let ctx = "in";

    // just remove the loop and the if statement in order to work...oh poor frank.
    while (ctx === "in") {
      if (this.currentToken?.type === "]" 
        || this.currentToken?.type === "NewLine" 
        || this.currentToken?.type === "EOF" 
      ) { break; };
    
      switch (this.currentToken?.type) {
        case "*":
          value.push(this.Italic());
          break;
        case "**":
          value.push(this.Bold());
          break;
        case "~":
          value.push(this.LineThrough());
          break;
        case "Literal":
          value.push({
            NodeType: 'Text',
            value: this.currentToken?.value
          });
          break;
        }

      this.nextToken();
    }

    return {
      NodeType: "ComposedText",
      children: value,
    };
  }

  ComposedText() {
    // let value = null;
    // switch (this.currentToken?.type) {
    //   case "*":
    //     value = this.Italic();
    //     break;
    //   case "**":
    //     value = this.Bold();
    //     break;
    //   case "~":
    //     value = this.LineThrough();
    //     break;
    //   case "Literal":

    //     break;
    // }

    let literal = this.currentToken?.value;
    return {
      NodeType: 'Text',
      value: literal
    };
  }

  isEof() {
    if(this.idx >= this.tokens.length) {
      return true;
    } 
    return false;
  }

  peek() {
    if(this.isEof()) {
      return { type: TokenType.Eof, value: "EOF" };
    } else {
      return this.tokens[this.idx];
    }

  }

  nextToken() {
    if(this.isEof()) {
      this.token = { type: TokenType.Eof, value: "EOF" };
    } else {
      this.currentToken = this.tokens[this.idx];
    }

    this.idx += 1;
  }

  consume(token, message) {
    if (token !== this.peek()?.type) {
      throw new SyntaxError(message);
    }
    this.nextToken();
    // this.nextToken();
  }

  previousToken (lookBack = 2) {
    if (this.idx === 0) {
      return "\0";
    }
    return this.tokens[this.idx - (lookBack)];
  }
}
