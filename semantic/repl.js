import { Semantic } from "./index.js";
import { parsed } from "../parser/repl.js";

const semantic = new Semantic(parsed);
// console.dir(parsed, { depth: null });

console.dir(semantic.analyze(), { depth: null });
