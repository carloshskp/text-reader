// Setup file for Jest tests
// Adds TransformStream polyfill if not available

// Node.js 18+ has TransformStream available
// Make sure it's available in the global scope for Jest
if (typeof globalThis.TransformStream === 'undefined') {
  try {
    // Try to import from stream/web (Node.js 18+)
    const streamWeb = require('stream/web');
    if (streamWeb.TransformStream) {
      globalThis.TransformStream = streamWeb.TransformStream;
    }
  } catch (e) {
    // TransformStream should be available in Node.js 22
    // If not, this will be caught by the test environment
  }
}

