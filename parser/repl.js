import { Tokenizer } from "../lexer/lexer.js";

import { Parser } from "./index.js";

const input = `
[How am gonna implement lists in Markd]
  ok, in order to implement lists, first i need to think how i want to write them.
  the idea will be the same as markdown because is something that works. I mean i'll use \`-\` for **unordered lists**.
  by now (unordered) lists is enough.

  there's a table of the differences between markd and markdown.

  Markd -> Markd
  Markd is very good -> D1
  i use Markd -> D2
%

(Markd) - **Markdown**
(D1) - Markdown is not very good
(D2) - i don't use Markdown
`

const tokenizer = new Tokenizer(input);
const tokens = []

while (true) {
  let value = tokenizer.make();
  tokens.push(...value); // Spread operator para lista plana
  if (value.some(token => token.type === "EOF")) {
    break;
  }
}


console.log(tokens);

const parser = new Parser(tokens);
export const parsed = parser.parse();

console.dir(parsed, { depth: null });

// edit: use Maps instead of Sets.

// [List]
//   My family healthy -> B
//   Be the programmer _software developer_ that i can be -> A
//   Empty -> C
//
// [Musics]
//   Heal The World -> AA
//   Numb -> AB
//   Numb Encore -> AC
//   Clouds -> AD
//   Come As You Are -> AE
//
// [Authors]
//   (AA) - Michael Jackson
//   (AB) - Linkin Park
//   (AC) - Linkin Park | Jz
//   (AD) - NF
//   (AE) - Nirvana
