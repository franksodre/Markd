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
    this.ctx = "GLOBAL";
  }

  make() {
    this.skipWhitespace();

    let tokens = [];
    if (this.char === "-") {
      if(this.peek() === '>') {
        this.nextChar();
        tokens.push(createToken(TokenType.Assignment, '->'));
        this.nextChar(); // consume the `>`
      } else {
        tokens.push(createToken(TokenType.Dash, this.char));
        this.nextChar();
      }
    }
    else if (this.char === ">") {
      tokens.push(createToken(TokenType.GreaterThan, this.char));
      this.nextChar();
    }

    else if (this.char === "(") {
      tokens.push(createToken(TokenType.LParen, this.char));
      this.nextChar();
    }

    else if (this.char === ")") {
      tokens.push(createToken(TokenType.RParen, this.char));
      this.nextChar();
    }

    else if (this.char === "[") {
      tokens.push(createToken(TokenType.LBracket, this.char));
      this.nextChar();
    }

    else if (this.char === "]") {
      tokens.push(createToken(TokenType.RBracket, this.char));
      this.nextChar();
    }

    else if (this.char === "#") {
      tokens.push(createToken(TokenType.HashTag, "HashTag"));

      if (this.peek() === "{") {
        let tok = [];
        this.nextChar();
        tok.push(createToken(TokenType.OpenBrace, "OpenBrace"));
        this.nextChar();

        // this is AI

        let buffer = "";
        let insideTilde = false;

        while (this.char !== "\0") {
          if (this.char === "}" && !insideTilde) {
            break;
          }

          if (this.char === "~") {
            if (insideTilde) {
              // Close tilde block
              tok.push(createToken(TokenType.Literal, buffer));
              tok.push(createToken(TokenType.Tilde, "~"));
              buffer = "";
              insideTilde = false;
            } else {
              // Start tilde block
              if (buffer) {
                tok.push(createToken(TokenType.Literal, buffer));
                buffer = "";
              }
              tok.push(createToken(TokenType.Tilde, "~"));
              insideTilde = true;
            }
            this.nextChar();
            continue;
          }

          buffer += this.char;
          this.nextChar();
        }

        if (buffer) {
          tok.push(createToken(TokenType.Literal, buffer));
        }

        if (this.char === "}") {
          tok.push(createToken(TokenType.CloseBrace, "CloseBrace"));
          this.nextChar(); // move past `}`
        }

        tok.map(x => {
          tokens.push(x);
          // console.log(x);
        })
      }
      this.nextChar();
    }

    // else if (this.char === "{") {
    //   this.ctx = "TEXT";
    //   tokens.push(createToken(TokenType.OpenBrace, ""));
    //
    //   // i need to skip blank chars in some where but i need to do it.
    //   if (this.ctx === "TEXT") {
    //     this.nextChar();
    //     let literal = "";
    //     let Tctx = "NORMAL";
    //
    //     while (this.ctx === "TEXT") {
    //       if (this.peek() === "}" && this.peek() !== null) {
    //         this.ctx = "GLOBAL";
    //       }
    //
    //       switch (this.char) {
    //         case "~":
    //           tokens.push(createToken(TokenType.Tilde, this.char));
    //           Tctx = "INSERT";
    //           break;
    //         default:
    //           // why he eat or request 4 chars?
    //           if (Tctx === "INSERT") {
    //             let ins = this.char; 
    //             this.nextChar();
    //             while (Tctx === "INSERT") {
    //               if (this.peek() === "~" && this.peek() !== null) {
    //                 Tctx = "NORMAL";
    //               }
    //               ins += this.char;
    //               this.nextChar();
    //             }
    //             tokens.push(createToken(TokenType.Literal, ins));
    //             tokens.push(createToken(TokenType.Tilde, this.char));
    //             this.nextChar(); // this is 3
    //             continue;
    //           }
    //
    //           literal += this.char;
    //           this.nextChar();
    //           continue;
    //       }
    //
    //       this.nextChar();
    //     }
    //
    //     tokens.push(createToken(TokenType.Literal, literal));
    //     tokens.push(createToken(TokenType.CloseBrace, "CloseBrace"));
    //   }
    //
    //   this.nextChar();
    // }

    else if (this.char === "}") {
      tokens.push(createToken(TokenType.CloseBrace, "CloseBrace"));
      this.nextChar();
    }

    else if (this.char === "|") {
      tokens.push(createToken(TokenType.Pipe, this.char));
      this.nextChar();
    }

    else if (this.char === "\0") {
      tokens.push(createToken(TokenType.Eof, "EOF"));
      this.nextChar();
    }

    else if (this.char === "\n") {
      tokens.push(createToken(TokenType.NewLine, ""));
      // unnecessary while. It could be an "if" statement ohh poor frank...
      while (this.peek() === "\n") {
        tokens.push(createToken(TokenType.Terminator, "Terminator"));
        this.nextChar();
      }
      this.nextChar();
    } else {
      if (Constants.isLetter(this.char)) {
        let literal = this.char;

        while(Constants.isLetter(this.peek()) || this.peek() === " " && Constants.isLetter(this.peek(2))) {
          literal += this.peek();
          this.nextChar();
        }

        tokens.push(createToken(TokenType.Literal, literal));
        // this.nextChar();
      } else {
        tokens.push(createToken("Illegal", this.char));
      }

    }


    /* this is a great way to take keywords not arbitrary text.*/

    this.nextChar();
    return tokens;

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

  skipWhitespace() {
    // || this.char === "\n"
    while (this.char === " " || this.char === "\t" || this.char === "\r") {
      this.nextChar();
    }
  }

}
