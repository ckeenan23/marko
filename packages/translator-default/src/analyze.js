import { isNativeTag } from "@marko/babel-utils";

export const staticNodes = new WeakSet();

export const visitor = {
  MarkoText(path) {
    staticNodes.add(path.node);
  },
  MarkoPlaceholder(path) {
    const { confident } = path.get("value").evaluate();
    if (confident && path.node.escape) staticNodes.add(path.node);
  },
  MarkoTag: {
    exit(path) {
      // check name
      let isStatic =
        isNativeTag(path) && !path.node.params && !path.node.arguments;

      // check attributes
      const attributes = path.get("attributes");
      const attrNames = Object.keys(attributes);
      isStatic =
        isStatic &&
        attrNames.every(attrName => {
          const attr = attributes[attrName];
          const { confident } = attr.get("value").evaluate();
          return confident && !attr.isMarkoAttribute();
        });

      // check children
      isStatic =
        isStatic &&
        path
          .get("body")
          .get("body")
          .every(t => staticNodes.has(t.node));
      if (isStatic) staticNodes.add(path.node);
    }
  }
};
