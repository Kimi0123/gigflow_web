import "@testing-library/jest-dom";

// Mock JSDOM missing methods
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}
