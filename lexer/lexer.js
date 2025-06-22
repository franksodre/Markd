import { TokenType } from '../tokens/tokens.js'
import * as Constants from './constants.js'

function createToken(type, value) {
  return { type, value };
}

export class Tokenizer {

  constructor(src) {
    this.src = src;
    this.nextChar();

    this.pos = 0;
    this.nextPos = 0;
    this.char = '';
    this.ctx = "global"; // i know context generaly is written in uppercase.

    this.isEmphasis = false;
    this.nextChar();
  }

  make() {
    this.skipWhitespace(this.isEmphasis);

    this.isEmphasis = false;

    let tokens = [];
    let literal = "";

    switch(this.char) {
      case '-': 
        if(this.peek() === '>') {
          this.nextChar();
          tokens.push(createToken(TokenType.Assignment, '->'));
        } else {
          tokens.push(createToken(TokenType.Dash, this.char));
        }
        break;
      case '>': 
        tokens.push(createToken(TokenType.GreaterThan, this.char));
        break;
      case '(': 
        tokens.push(createToken(TokenType.LParen, this.char));
        break;
      case ')': 
        tokens.push(createToken(TokenType.RParen, this.char));
        break;
      case '[': 
        this.ctx = "group_start|strict"
        tokens.push(createToken(TokenType.LBracket, this.char));
        break;
      case ']': 
        this.ctx = "group_end|strict"
        tokens.push(createToken(TokenType.RBracket, this.char));
        break;
      case '#':
        tokens.push(createToken(TokenType.HashTag, "HashTag"));
        break;
      case '*': 
        this.isEmphasis = this.peek() !== "\n" ? true : false;
        if (this.peek() === "*") {
          this.nextChar();
          tokens.push(createToken(TokenType.DoubledAsterisk, "**"));
          break;
        }
        tokens.push(createToken(TokenType.Asterisk, this.char));

        break;
      case '~': 
        this.isEmphasis = this.peek() !== "\n" ? true : false;
        tokens.push(createToken(TokenType.Tilde, this.char));
        break;
      case '|': 
        tokens.push(createToken(TokenType.Pipe, this.char));
        break;
      case '\0':
        tokens.push(createToken(TokenType.Eof, "EOF"));
        break;
      case '\n':
        tokens.push(createToken(TokenType.NewLine, ""));
        break;
      case '%':
        this.ctx = "group|terminator|global"
        tokens.push(createToken(TokenType.Terminator, "%"));
        break;
      default:
        literal = this.char;
        this.isEmphasis = false;
        while (!(this.tokBasedOnContext(this.ctx)).includes(this.peek())) {
          if (this.peek() === "!") {
            let buf = this.peek();
            let ins = false;
            // peek(2) works but am not that sure!
            while (this.peek() !== " " && this.peek(2) !== "\n") {
              if (this.peek() === "*" || this.peek() === "~") {
                ins = true;
              }

              this.nextChar();
              buf += this.peek();
            }


            buf = ins ? buf.slice(1, -1) : buf;
            literal += buf;
          }

          literal += this.peek(); 

          this.nextChar();
        }

        this.ctx = "global" // text!
        tokens.push(createToken(TokenType.Literal, literal));
        break;
    }

    // this don't work if the precceded char is a special char.
    // i wanted to check if is inText also but in this way just works.
    
    // this.ctx != "group|terminator" && 
    if (this.ctx != "group|terminator" && this.peek() === "\n") {
      this.nextChar();
      if (this.peek() === "\n") {
        this.ctx = "global"
        tokens.push(createToken(TokenType.LiteralEnd, "LiteralEnd"));
        this.nextChar();
      } else {
        // this.ctx = "text"
        tokens.push(createToken(TokenType.NewLine, ""));
      }

    }

    this.nextChar();
    return tokens;

  }

  tokBasedOnContext (ctx) {
    const tokenCtx = {
      ["group_start|strict"]: ["]", "%", "(", ")", "-", ">", "*", "~", "|", "#", "\n"],
      ["group_end|strict"]: ["%", "(", ")", "-", ">", "*", "~", "|", "#", "\n"],
      ["global"]: ["]", "[", "%", "(", ")", "-", ">", "*", "~", "|", "#", "\n"],
      ["text"]: ["]", "[", "%", "*", "~", "\n"],
      ["group|terminator|global"]: ["%", "]", "[", "(", ")", "-", ">", "*", "~", "|", "#", "\n"]
    }

    return tokenCtx[ctx];
  }

  peek(lookahed = 1) {
    if (this.nextPos >= this.src.length) {
      return '\0';
    } else if ((this.nextPos + (lookahed - 1)) >= this.src.length) {
      return '\0';
    } else {
      return this.src[this.nextPos + (lookahed - 1)];
    }
  }

  nextChar() {
    if (this.nextPos >= this.src.length) {
      this.char = "\0";
    } else {
      this.char = this.src[this.nextPos];
    }

    this.pos = this.nextPos;
    this.nextPos += 1;
  }

  peekBack() {
    if (this.nextPos >= this.src.length) {
      return this.src[this.pos];
    } else if ( this.pos === 0) {
      return "\0";
    } else {
      return this.src[this.pos - 1];
    }

  }

  skipWhitespace(emphasis) {
    // || this.char === "\n"
    while (!emphasis && this.char === " " || this.char === "\t" || this.char === "\r") {
      this.nextChar();
    }
  }

}

// ctx | accept " "
// const input = `
// My Family Healthy -> B
// My Day -> A
// `;
// const tokenizer = new Tokenizer(input);
// while(true) {
//   let tokens = tokenizer.make();
//   console.log(tokens);
//
//   if(tokens.type === "EOF") {
//     break;
//   }
// }

