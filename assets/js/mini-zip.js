/* Mini-ZIP — écriture d'archives .zip en mode "store" (sans compression),
   suffisant pour DOCX et pour regrouper des fichiers. ~60 lignes, 0 dépendance. */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};
const te = new TextEncoder();

/** files: [{name: string, data: Uint8Array | string}] → Blob zip.
    Le type MIME est celui du contenant final (DOCX, ZIP…) : Android s'en sert
    pour choisir l'application d'ouverture — un .docx en « application/zip »
    était proposé comme archive au lieu de s'ouvrir dans Word. */
export function makeZip(files, mime = 'application/zip') {
  const enc = files.map((f) => ({
    name: te.encode(f.name),
    data: typeof f.data === 'string' ? te.encode(f.data) : f.data,
  }));
  const chunks = [];
  const central = [];
  let offset = 0;
  const push = (...arrays) => { arrays.forEach((a) => chunks.push(a)); };
  const u16 = (n) => new Uint8Array([n & 255, (n >> 8) & 255]);
  const u32 = (n) => new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255]);

  for (const f of enc) {
    const crc = crc32(f.data);
    const local = [u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
      u32(crc), u32(f.data.length), u32(f.data.length), u16(f.name.length), u16(0)];
    push(...local, f.name, f.data);
    central.push({ f, crc, offset });
    offset += local.reduce((a, u) => a + u.length, 0) + f.name.length + f.data.length;
  }
  const cdStart = offset;
  for (const { f, crc, offset: off } of central) {
    push(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
      u32(crc), u32(f.data.length), u32(f.data.length), u16(f.name.length),
      u16(0), u16(0), u16(0), u16(0), u32(0), u32(off), f.name);
    offset += 46 + f.name.length;
  }
  push(u32(0x06054b50), u16(0), u16(0), u16(enc.length), u16(enc.length),
    u32(offset - cdStart), u32(cdStart), u16(0));
  return new Blob(chunks, { type: mime });
}
