// Add complete emoji sequences as a searchable category in every encoding view.
function emojiRow(row, encoding) {
  const [char, name, keywords] = row;
  const points = Array.from(char, ch => ch.codePointAt(0));
  const hex = n => n.toString(16).toUpperCase().padStart(4, '0');
  let encoded;
  if (encoding === 'ucs2' && points.some(cp => cp > 0xFFFF)) {
    encoded = 'Not representable in UCS-2';
  } else if (encoding === 'utf8') {
    encoded = Array.from(new TextEncoder().encode(char), n => n.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  } else {
    encoded = char.split('').map(ch => hex(ch.charCodeAt(0))).join(' ');
  }
  return [points.map(cp => 'U+' + hex(cp)).join(' '), encoded, char, name, keywords];
}

const emojiEncoding = document.currentScript.dataset.encoding;
let emojiCategoryIndex = CATEGORIES.findIndex(category => category.name === 'Emoticons');
// UCS-2 omits supplementary Unicode blocks; retain its complete emoji browser.
if (emojiCategoryIndex === -1) {
  emojiCategoryIndex = CATEGORIES.length;
  CATEGORIES.push({name: 'Emoticons'});
}
Object.assign(CATEGORIES[emojiCategoryIndex], {
  desc: '전체 이모티콘 · 한국어/영어 텍스트 검색',
  range: 'Unicode Emoji 17.0 · 3,953 emoji',
});
CHAR_DATA[emojiCategoryIndex] = EMOJI_DATA.map(row => emojiRow(row, emojiEncoding));

// Use the same font stack as the visible characters. Keep only compact color
// glyphs: missing-glyph boxes and decomposed sequences must not enter the list.
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
function hasColorGlyph(context, char) {
  context.clearRect(0, 0, 80, 64);
  context.font = '32px ' + EMOJI_FONT;
  context.textBaseline = 'top';
  context.fillStyle = '#000';
  const width = context.measureText(char).width;
  if (width <= 0 || width > 48) return false;
  context.fillText(char, 4, 4);
  const pixels = context.getImageData(0, 0, 80, 64).data;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 128 &&
        Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) -
        Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 20) return true;
  }
  return false;
}

async function filterUnsupportedEmoji(progress) {
  if (document.fonts) await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 64;
  const context = canvas.getContext('2d', {willReadFrequently: true});
  const hidden = new Set();
  for (let i = 0; i < EMOJI_DATA.length; i++) {
    const char = EMOJI_DATA[i][0];
    let supported = false;
    try { supported = context && hasColorGlyph(context, char); } catch (_) { /* Canvas unavailable. */ }
    if (!supported) hidden.add(char.replace(/\uFE0F/g, ''));
    if (i % 100 === 0) {
      progress(Math.round(i / EMOJI_DATA.length * 50), '표시 가능한 이모티콘 확인 중…');
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  for (const key of Object.keys(CHAR_DATA)) {
    CHAR_DATA[key] = CHAR_DATA[key].filter(row => !hidden.has(row[2].replace(/\uFE0F/g, '')));
  }
  const count = CHAR_DATA[emojiCategoryIndex].length;
  CATEGORIES[emojiCategoryIndex].desc = '표시 가능한 이모티콘 · 한국어/영어 텍스트 검색';
  CATEGORIES[emojiCategoryIndex].range = `${count.toLocaleString()} emoji · 표시되지 않는 항목 제외`;
}
