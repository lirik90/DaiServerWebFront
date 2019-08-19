function imageDataTo1Bit(src: ImageData) {
  let dstWidth = Math.round(src.width / 8); // i.e. 8 pixel in one byte

  // padding to multiple-of-four
  while (dstWidth % 4 !== 0) {
    dstWidth++;
  }

  const dst = new Uint8Array(dstWidth * src.height);

  let dstPos = 0;

  for (let y = src.height - 1; y >= 0; y--) { // from bottom to top
    let dstEl = 0;
    let bitPos = 7;

    for (let x = 0; x < src.width; x++) {
      const srcEl = src.data[(y * src.width + x) * 4]; // 'times 4' because of RGBA

      // tslint:disable-next-line:no-bitwise
      dstEl |= srcEl << bitPos; // '8 minus' to reverse indianness

      bitPos--;
      if (bitPos < 0) {
        bitPos = 7;
        dst[dstPos] = dstEl;
        dstPos++;
        dstEl = 0;
      }
    }
    dst[dstPos] = dstEl;
    dstPos++;

    while (dstPos % 4 !== 0) {
      dstPos++;
    }
  }

  return dst;
}

function byte(n: number): Uint8Array {
  const res = new Uint8Array(1);

  res[0] = n;

  return res;
}

function word(n: number): Uint8Array {
  const res = new Uint8Array(2);

  res[0] = n;
  // tslint:disable-next-line:no-bitwise
  res[1] = n >> 8;

  return res;
}

function dword(n: number): Uint8Array {
  const res = new Uint8Array(4);

  res[0] = n;
  // tslint:disable:no-bitwise
  res[1] = n >> 8;
  res[2] = n >> 16;
  res[3] = n >> 24;
  // tslint:enable:no-bitwise

  return res;
}

function mergeAll(arr: Uint8Array[]): Uint8Array {
  return arr.reduce(merge, new Uint8Array([]));
}

function bitMapV4Header(width: number, height: number, pixelDataSize: number): Uint8Array {
  return new Uint8Array(mergeAll([
    dword(108), // header size
    dword(width), // width
    dword(height), // height
    word(1), // planes
    word(1), // bit per pixel
    dword(0), // BI_RGB, no pixel array compression used
    dword(pixelDataSize), // Size of the raw bitmap data (including padding)
    dword(2835), // Print resolution of the image HORIZONTAL
    dword(2835), // Print resolution of the image VERTICAL
    dword(2), // Number of colors in the palette
    dword(2), // important colors
    byte(0x42), // B
    byte(0x47), // G
    byte(0x52), // R
    byte(0x73), // s
    dword(0), dword(0), dword(0), dword(0), dword(0), dword(0), dword(0), dword(0),
    dword(0), dword(0), dword(0), dword(0), dword(0), dword(0), dword(0), dword(0)
  ]));
}

function bitmapFileHeader(bitMapInfoSize: number, pixelDataSize: number, palletSize: number) {
  const fileHeaderSize = 14;

  return new Uint8Array(mergeAll([
    byte(0x42), byte(0x4d), // BM
    dword(fileHeaderSize + bitMapInfoSize + pixelDataSize + palletSize), // file size
    word(0),
    word(0),
    dword(fileHeaderSize + bitMapInfoSize + palletSize) // offset pixel data
  ]));
}

function merge(a: Uint8Array, b: Uint8Array): Uint8Array {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

function colorPallet(): Uint8Array {
  const res = new Uint8Array(8);

  // first color -- Black
  res[0] = 0x00;
  res[1] = 0x00;
  res[2] = 0x00;
  res[3] = 0x00;

  // second color -- White
  res[4] = 0xFF;
  res[5] = 0xFF;
  res[6] = 0xFF;
  res[7] = 0x00;

  return res;
}

export function create1BitBitmap(src: ImageData) {
  const pixelData = imageDataTo1Bit(src);

  const pallet = colorPallet();

  const coreHeader = bitMapV4Header(src.width, src.height, pixelData.length);
  const bmpFileHeader = bitmapFileHeader(coreHeader.length, pixelData.length, pallet.length);

  return mergeAll([bmpFileHeader, coreHeader, pallet, pixelData]);
}
