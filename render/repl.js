import { parsed } from "../parser/repl.js"
import { Semantic } from "../semantic/index.js";
import { HTMLRenderer } from "./index.js";


const ast = parsed;

const semantic = new Semantic(ast);
const table = semantic.analyze();
const flags = semantic.flagged;

const renderer = new HTMLRenderer(ast, table, flags);
const html = renderer.render();

console.log(html);

