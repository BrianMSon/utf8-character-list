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
