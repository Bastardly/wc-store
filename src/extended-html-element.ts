type WritableStyleKeys = {
  [K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string
    ? K
    : never;
}[keyof CSSStyleDeclaration];

type StyleKey = WritableStyleKeys | `--${string}`; // To allow CSS variables
type StyleMap = Partial<Record<StyleKey, string>>;

/**
 * Extended HTMLElement class providing utility methods for managing attributes, styles, and classes.
 * @extends HTMLElement
 */
export class ExtendedHTMLElement extends HTMLElement {
  /**
   * Retrieves attributes from the element or sets them with default values if they don't exist.
   * @template T - String literal type for attribute keys
   * @param {Record<T, string>} defaultAttributes - Object containing default attribute key-value pairs
   * @returns {Record<T, string>} Object containing the actual or default attribute values
   * @example
   * const attrs = element.getSetAttributesFromList({ 'data-id': '1', 'data-name': 'default' });
   */
  getSetAttributesFromList<T extends string>(
    defaultAttributes: Record<T, string>
  ): Record<T, string> {
    const list = Object.keys(defaultAttributes) as T[];
    const result: Record<T, string> = {} as Record<T, string>;

    list.forEach((key) => {
      const attrValue = this.getAttribute(key);
      if (attrValue !== null) {
        result[key] = attrValue;
      } else {
        result[key] = defaultAttributes[key];
        this.setAttribute(key, defaultAttributes[key]);
      }
    });
    return result;
  }

  /**
   * Applies CSS styles to the target element.
   * @param {Partial<Record<CSSKeys, string>>} styleObject - Object containing CSS property-value pairs
   * @param {HTMLElement} [target=this] - Target element to apply styles to (defaults to current element)
   * @example
   * element.appendStyles({ color: 'red', fontSize: '16px', '--custom-var': '10px' });
   */
  appendStyles(styleObject: StyleMap, target: HTMLElement = this) {
    Object.keys(styleObject).forEach((key) =>
      target.style.setProperty(
        key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), // camelCase to kebab-case
        styleObject[key as StyleKey] as string
      )
    );
  }

  /**
   * Sets multiple attributes on the target element.
   * @param {Record<string, string>} attributes - Object containing attribute key-value pairs
   * @param {HTMLElement} [target=this] - Target element to set attributes on (defaults to current element)
   * @example
   * element.appendAttributes({ 'aria-label': 'Button', 'data-id': '123' });
   */
  appendAttributes(
    attributes: Record<string, string>,
    target: HTMLElement = this
  ) {
    for (const key in attributes) {
      target.setAttribute(key, attributes[key]);
    }
  }

  /**
   * Conditionally adds or removes CSS classes on the target element based on boolean values.
   * @param {Record<string, boolean>} classNames - Object mapping class names to boolean values (true to add, false to remove)
   * @param {HTMLElement} [target=this] - Target element to modify classes on (defaults to current element)
   * @example
   * element.appendStyleClasses({ 'active': true, 'hidden': false });
   */
  appendStyleClasses(
    classNames: Record<string, boolean>,
    target: HTMLElement = this
  ) {
    for (const key in classNames) {
      const hasClass = this.classList.contains(key);

      if (hasClass && !classNames[key]) {
        target.classList.remove(key);
      } else if (!hasClass && classNames[key]) {
        target.classList.add(key);
      }
    }
  }
}
