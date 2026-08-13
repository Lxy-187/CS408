/* 直接在 Node 里生成图标 PNG —— 不经过任何 base64 传输，避免截断。
   画法：把 ❯ 当成一条折线（两段直线 + 圆角），沿路径盖圆盘，
   4 倍超采样后降采样得到抗锯齿。输出 colorType=2（RGB，无 alpha）。
   跑法：node tools-genicon.js assets/icon */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

/* ---------------- CRC32 ---------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 2;    // color type 2 = truecolor RGB，无 alpha
  const stride = w * 3;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;   // filter 0
    Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride)
      .copy(raw, y * (stride + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------- 画 ❯ ---------------- */
// 单位坐标 (0..1)，y 向下。折线的三个顶点。
const PTS = [
  [0.355, 0.235],
  [0.680, 0.500],
  [0.355, 0.765],
];

function pointAt(t) {                 // t ∈ [0,1] 走完整条折线
  const seg = t < 0.5 ? 0 : 1;
  const u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const a = PTS[seg], b = PTS[seg + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

const BG = [0x0d, 0x94, 0x88];
const FG = [0xff, 0xff, 0xff];

function render(size) {
  const SS = 4;                       // 超采样倍数
  const G = size * SS;
  const cov = new Uint8Array(G * G);

  const r = 0.058 * G;                // 笔画半径
  const r2 = r * r;
  const N = 2400;

  for (let i = 0; i <= N; i++) {
    const [ux, uy] = pointAt(i / N);
    const cx = ux * G, cy = uy * G;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(G - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(G - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) {
      const dy = y + 0.5 - cy;
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx;
        if (dx * dx + dy * dy <= r2) cov[y * G + x] = 1;
      }
    }
  }

  const out = new Uint8Array(size * size * 3);
  const per = SS * SS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hit = 0;
      for (let sy = 0; sy < SS; sy++) {
        const row = (y * SS + sy) * G + x * SS;
        for (let sx = 0; sx < SS; sx++) hit += cov[row + sx];
      }
      const a = hit / per;
      const o = (y * size + x) * 3;
      for (let k = 0; k < 3; k++) out[o + k] = Math.round(BG[k] * (1 - a) + FG[k] * a);
    }
  }
  return out;
}

/* ---------------- 输出并自检 ----------------
   只查 PNG 签名和尺寸是不够的：那两样都在文件最前面 25 个字节里，
   文件后面被截断多少都查不出来。必须逐块验 CRC 并解压 IDAT。 */
function verify(file) {
  const b = fs.readFileSync(file);
  if (b.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(file + '：签名错误');
  let p = 8, idat = [], w, h, seenIEND = false;
  while (p < b.length) {
    const len = b.readUInt32BE(p);
    const type = b.slice(p + 4, p + 8).toString('latin1');
    if (p + 12 + len > b.length) throw new Error(file + '：' + type + ' 块越界（文件被截断）');
    if (b.readUInt32BE(p + 8 + len) !== crc32(b.slice(p + 4, p + 8 + len)))
      throw new Error(file + '：' + type + ' 块 CRC 不符');
    if (type === 'IHDR') { w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12); }
    if (type === 'IDAT') idat.push(b.slice(p + 8, p + 8 + len));
    if (type === 'IEND') seenIEND = true;
    p += 12 + len;
  }
  if (!seenIEND) throw new Error(file + '：缺少 IEND');
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const want = h * (1 + w * 3);
  if (raw.length !== want) throw new Error(file + '：像素数据长度 ' + raw.length + '，应为 ' + want);
  let white = 0;
  for (let i = 0; i < h; i++) {
    const off = i * (1 + w * 3) + 1;
    for (let j = 0; j < w; j++) if (raw[off + j * 3] > 200) white++;
  }
  return { file: path.basename(file), size: w + 'x' + h, bytes: b.length,
           fg: (white / (w * h) * 100).toFixed(1) + '%' };
}

const dir = process.argv[2] || 'assets/icon';
fs.mkdirSync(dir, { recursive: true });
const names = { 32: 'favicon-32.png', 180: 'apple-touch-icon.png' };
const report = [];
for (const s of [32, 152, 167, 180, 192, 512]) {
  const file = path.join(dir, names[s] || ('icon-' + s + '.png'));
  fs.writeFileSync(file, encodePNG(s, s, render(s)));
  report.push(verify(file));
}
console.table(report);
