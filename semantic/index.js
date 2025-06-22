import { Parser } from "../parser/index.js";

export class Semantic {
  constructor(ast){
    this.ast = ast;
    this.table = new Map();
    this.flagged = new Map();
    this.diagnostics = [];

    // this.analyze();

  }

  analyze () {
    for (const node of this.ast) {
      switch(node.NodeType) {
        case 'Assignment':
          if(this.table.has(node.name)) {
            throw new Error("variable " + '"' + node.name + '"' + " already defined");
          }
          this.table.set(node.name, node.value);
          break;
        case 'PinFlag':
          this.checks(node);
          break;
        case 'Reference':
          this.checks(node);
          break;
        case 'Group':
          this.group(node.value);
          break;
      }

    }

    this.diagnostics.push(this.table, this.flagged);
    return this.table;
  }

  checks(node) {
    switch (node.NodeType) {
      case 'PinFlag':
        this.pinFlag(node);
        break;
      case 'Reference':
        this.reference(node);
        break
      case 'Group':
        this.group(node);
        break
    }
  }

  group (node) {
    for (const branch of node) {
      switch (branch.NodeType) { 
        case 'Assignment':
          if(this.table.has(branch.name)) {
            throw new Error("variable " + '"' + branch.name + '"' + " already defined");
          }

          this.table.set(branch.name, branch.value);
          break;
        case 'PinFlag':
          this.pinFlag(branch)
          break;
        case 'Reference':
          this.reference(branch);
          break;
      }
    }
  }

  pinFlag(node) {
    const nodeName = node.ref.name.value;
    const values = [];

    if(!this.table.has(nodeName)) {
      throw new Error("undefined reference to " + '"' + nodeName + '"');
    }

    if(this.flagged.has(nodeName)) {
      throw new Error("pin with reference to " + '"' + nodeName + '"' + " already exists");
    }

    for (const value of node.value.value) {
      // nice frank!
      values.push(...value.children);
    }
    this.flagged.set(nodeName, values);
  }

  reference(node) {
    const { value } = node.name;
    throw new Error(
      "references are not allowed outside a pin.\n" 
      + "reference to " + '"' + value + '"'
    );
  }
}


