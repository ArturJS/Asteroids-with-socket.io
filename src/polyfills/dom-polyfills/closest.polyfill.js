((e) => {
  e.closest = e.closest || function closest(css) {
    let node = this;

    while (node) {
      if (node.matches(css)) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  };
})(Element.prototype);
