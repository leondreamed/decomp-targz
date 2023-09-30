import fs from "fs";
import isJpg from "is-jpg";
import test from "ava";
import m from "./index.js";
import { join, filename } from "desm";

test("extract file", async (t) => {
  const buf = await fs.promises.readFile(
    join(import.meta.url, "fixtures", "file.tar.gz")
  );
  const files = await m()(buf);

  t.is(files[0].path, "test.jpg");
  t.true(isJpg(files[0].data));
});

test("extract file using streams", async (t) => {
  const stream = fs.createReadStream(
    join(import.meta.url, "fixtures", "file.tar.gz")
  );
  const files = await m()(stream);

  t.is(files[0].path, "test.jpg");
  t.true(isJpg(files[0].data));
});

test("return empty array if non-valid file is supplied", async (t) => {
  const buf = await fs.promises.readFile(filename(import.meta.url));
  const files = await m()(buf);

  t.is(files.length, 0);
});

test("throw on wrong input", async (t) => {
  await t.throwsAsync(() => m()("foo"), {
    message: "Expected a Buffer or Stream, got string",
  });
});

// Don't run this test on Node.js v4
// https://github.com/nodejs/node/commit/80169b1f0a5f944b99e82a409536dea426c992f3
if (!process.version.startsWith("v4")) {
  test("handle gzip error", async (t) => {
    const buf = await fs.promises.readFile(
      join(import.meta.url, "fixtures", "fail.tar.gz")
    );
    const err = await t.throwsAsync(() => m()(buf), {
      message: "unexpected end of file",
    });
    t.is(err.code, "Z_BUF_ERROR");
  });
}
