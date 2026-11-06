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
for (let i = CATEGORIES.length - 1; i >= 0; i--) CHAR_DATA[i + 1] = CHAR_DATA[i];
CATEGORIES.unshift({name: 'Emoticon / Emoji', desc: '전체 이모티콘 · 한국어/영어 텍스트 검색', range: 'Unicode Emoji 17.0 · 3,953 emoji'});
CHAR_DATA[0] = EMOJI_DATA.map(row => emojiRow(row, emojiEncoding));
