export class HTMLRenderer {
  constructor(ast, table, flags) {
    this.ast = ast;
    this.symbolTable = table;
    this.flags = flags;
    this.output = [];
  }

  render() {
    for (const node of this.ast) {
      this.output.push(this.renderNode(node));
    }
    return this.output.join('');
  }

  renderNode(node) {
    switch (node.NodeType) {
      case 'Assignment':
        return this.renderAssignment(node);
      case 'Paragraph':
        return this.renderParagraph(node);
      case 'Group':
        return this.renderGroup(node);
      // case 'PinFlag':
      //   return this.renderPinFlag(node);
      // case 'Reference':
      //   return this.renderReference(node);
      case 'Value':
        return this.renderValue(node);
      case 'Text':
        return this.renderText(node);
      case 'ComposedText':
        return this.renderComposedText(node);
      case 'Italic':
        return this.renderItalic(node);
      case 'Bold':
        return this.renderBold(node);
      case 'LineThrough':
        return this.renderLineThrough(node);
      default:
        return '';
    }
  }

  renderAssignment(node) {
    const { value, name } = node;
    // absolute cinema. nice again frank!
    if (name === this.flags.keys().next().value) {
      let pins = this.flags.get(name);
      console.log(value);
      const refContent = this.renderNode(...value);
      const pinLabel = pins.map(pin => this.renderNode(pin)).join("");

      this.flags.delete(name);
      return `<li class="var">${refContent}<span class="pin">${pinLabel}</span></li>`;
    }
    return this.renderNode(value);
  }

  renderParagraph (node) {
    const { children } = node;
    const values = children.map(child => this.renderNode(child)).join("");

    return `<div class="block block_paragraph">${values}</div>`
  }

  renderGroup(node) {
    const { name, value } = node;

    const groupName = name.children.map(child => this.renderNode(child)).join("");

    const groupClassName = name.children.map(child => 
      child.NodeType === "Text" 
      ? child.value 
      : child.value.value)
        .toString()
        .replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

    const children = value.map(child => this.renderNode(child)).join('');

    return `<h2>${groupName}</h2><div class="group group-${groupClassName}">${children}</div>`;
  }

  renderPinFlag(node) {
    const { ref, value } = node;
    const refContent = this.renderReference(ref);
    const pinLabel = value ? value.value.map(pin => this.renderNode(pin)).join("") : this.renderNode(ref.name);
    // here
    return `<li>${refContent}<span class="pin">${pinLabel}</span></li>`;
  }

  renderReference(node) {
    const { name } = node;
    if (this.symbolTable.has(name.value)) {
      const resolved = this.symbolTable.get(name.value);
      console.log(resolved);
      return this.renderNode(...resolved);
    }
    return `<span class="error">Undefined: ${name.value}</span>`;
  }

  renderValue(node) {
    const { value } = node;
    const values = value.map(val => this.renderNode(val)).filter(v => v);
    return values.length > 0 ? values[0] : '';
  }

  renderText(node) {
    const { value } = node;
    // return this.escapeHtml(value);
    return `<span class="text">${value}</span>`
  }

  renderComposedText(node) {
    const { children } = node;
    const childrenHtml = children.map(child => this.renderNode(child)).join("");
    // ?.map(child => this.renderNode(child)).join('');

    return `<div class="composed-text">${childrenHtml}</div>`;
  }

  renderItalic(node) {
    const { value } = node;
    return `<i>${this.renderNode(value)}</i>`;
  }

  renderBold(node) {
    const { value } = node;
    return `<b>${this.renderNode(value)}</b>`;
  }

  renderLineThrough(node) {
    const { value } = node;
    return `<s>${this.renderNode(value)}</s>`;
  }

  // escapeHtml(str) {
  //   // const div = document.createElement('div');
  //   // div.textContent = str;
  //   // return div.innerHTML;
  //   return str
  // }
}
