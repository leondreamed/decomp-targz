import zlib from "zlib";
import decompressTar from "decomp-tar";
import fileType from "file-type";
import { isStream } from "is-stream";

export default () => (input) => {
  if (!Buffer.isBuffer(input) && !isStream(input)) {
    return Promise.reject(
      new TypeError(`Expected a Buffer or Stream, got ${typeof input}`)
    );
  }

  if (Buffer.isBuffer(input) && fileType(input)?.ext !== "gz") {
    return Promise.resolve([]);
  }

  const unzip = zlib.createGunzip();
  const result = decompressTar()(unzip);

  if (Buffer.isBuffer(input)) {
    unzip.end(input);
  } else {
    input.pipe(unzip);
  }

  return result;
};
