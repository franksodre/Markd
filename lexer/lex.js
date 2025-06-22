import { TokenType } from '../tokens/tokens.js';
import * as Constants from './constants.js';

function createToken(type, value) {
  return { type, value };
}

export class Tokenizer {
  constructor(src) {
    this.src = src;
    this.pos = 0;
    this.nextPos = 0;
    this.char = '';
    this.ctx = "GLOBAL";
    this.nextChar();
  }

  make() {
    let tokens = [];

    while (this.char !== '\0') {
      this.skipWhitespace();

      if (this.char === '-') {
        if (this.peek() === '>') {
          this.nextChar(); // consume '-'
          this.nextChar(); // consume '>'
          tokens.push(createToken(TokenType.Assignment, '->'));
        } else {
          tokens.push(createToken(TokenType.Dash, this.char));
          this.nextChar();
        }
      }

      else if (this.char === '>') {
        tokens.push(createToken(TokenType.GreaterThan, this.char));
        this.nextChar();
      }

      else if (this.char === '(') {
        tokens.push(createToken(TokenType.LParen, this.char));
        this.nextChar();
      }

      else if (this.char === ')') {
        tokens.push(createToken(TokenType.RParen, this.char));
        this.nextChar();
      }

      else if (this.char === '[') {
        tokens.push(createToken(TokenType.LBracket, this.char));
        this.nextChar();
      }

      else if (this.char === ']') {
        tokens.push(createToken(TokenType.RBracket, this.char));
        this.nextChar();
      }

      else if (this.char === '#') {
        tokens.push(createToken(TokenType.HashTag, "HashTag"));
        if (this.peek() === '{') {
          let tok = [];
          this.nextChar(); // move to '{'
          tok.push(createToken(TokenType.OpenBrace, "OpenBrace"));
          this.nextChar();

          let buffer = "";
          let insideTilde = false;

          while (this.char !== "\0") {
            if (this.char === "}" && !insideTilde) break;
            let char = "";

            if (this.char === "~") {
              char = "~";
            } else if (this.char === "*") {
              char = "*";
            } 
            // nice Frank!
            else if (this.char === "!") {
              let buf = this.char;
              let ins = false;
              while (this.char !== " ") {
                if (this.char === "*" || this.char === "~") {
                  ins = true;
                }

                this.nextChar();
                buf += this.char;
              }

              buf = ins ? buf.slice(1, -1) : buf;
              buffer += buf;

            }

            if (this.char === char) {
              // anoying but works, and i don't care.
              if (this.peek() === "*") {
                this.nextChar();
                char = "**"
              }

              if (insideTilde) {
                tok.push(createToken(TokenType.Literal, buffer));
                buffer = "";
                insideTilde = false;
              } else {
                if (buffer) {
                  tok.push(createToken(TokenType.Literal, buffer));
                  buffer = "";
                }
                insideTilde = true;
              }
              tok.push(createToken(char, char));
              this.nextChar();
              continue;
            }

            buffer += this.char;
            this.nextChar();
          }

          if (buffer) tok.push(createToken(TokenType.Literal, buffer));

          if (this.char === "}") {
            tok.push(createToken(TokenType.CloseBrace, "CloseBrace"));
            this.nextChar();
          }

          tok.forEach(t => tokens.push(t));
        } else {
          this.nextChar();
        }
      }

      // kind of useless
      else if (this.char === '}') {
        tokens.push(createToken(TokenType.CloseBrace, "CloseBrace"));
        this.nextChar();
      }

      else if (this.char === '|') {
        tokens.push(createToken(TokenType.Pipe, this.char));
        this.nextChar();
      }

      else if (this.char === '\n') {
        tokens.push(createToken(TokenType.NewLine, ""));
        // while (this.peek() === "\n") {
        //   this.nextChar();
        //   tokens.push(createToken(TokenType.Terminator, "Terminator"));
        // }
        this.nextChar();
      }

      else if (this.char === "%") {
        tokens.push(createToken(TokenType.Terminator, "%"));
        this.nextChar();
      }

      else if (Constants.isLetter(this.char)) {
        let literal = this.char;
        while (Constants.isLetter(this.peek()) || (this.peek() === " " && Constants.isLetter(this.peek(2)))) {
          this.nextChar();
          literal += this.char;
        }
        tokens.push(createToken(TokenType.Literal, literal));
        this.nextChar();
      }

      else {
        tokens.push(createToken("Illegal", this.char));
        this.nextChar();
      }
    }

    tokens.push(createToken(TokenType.Eof, "EOF"));
    return tokens;
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

  peek(lookahead = 1) {
    if (this.nextPos + (lookahead - 1) >= this.src.length) {
      return '\0';
    }
    return this.src[this.nextPos + (lookahead - 1)];
  }

  skipWhitespace() {
    while (this.char === " " || this.char === "\t" || this.char === "\r") {
      this.nextChar();
    }
  }
}

