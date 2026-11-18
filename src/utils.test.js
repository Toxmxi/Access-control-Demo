import assert from "node:assert/strict";
import test from "node:test";
import { downloadCsv } from "./utils.js";

test("downloadCsv neutralizes formula-prefixed text and preserves numeric values", async () => {
  let blob;
  const originalDocument = globalThis.document;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  try {
    globalThis.document = { createElement: () => ({ click() {} }) };
    URL.createObjectURL = (value) => {
      blob = value;
      return "blob:test";
    };
    URL.revokeObjectURL = () => {};

    downloadCsv("test.csv", ["value"], [
      ["=1+1"],
      [" \t@SUM(A1:A2)"],
      ["+1+1"],
      ["-1+2"],
      ["\u0001=1"],
      ["normal"],
      [-123],
    ]);
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  }

  const csv = await blob.text();
  for (const value of ["'=1+1", "' \t@SUM(A1:A2)", "'+1+1", "'-1+2", "'\u0001=1"]) {
    assert.ok(csv.includes(value), `missing neutralized value: ${JSON.stringify(value)}`);
  }
  assert.ok(csv.includes('"normal"'));
  assert.ok(csv.includes('"-123"'));
});
