const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&nbsp;': ' ',
  '&middot;': '·',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&mdash;': '—',
  '&ndash;': '–',
  '&#x3D;': '=',
  '&#x60;': '`',
};

const decode = (text) =>
  text.replace(/&(?:[a-z]+|#x?[0-9a-f]+);/gi, (entity) => {
    if (ENTITIES[entity]) return ENTITIES[entity];
    if (/^&#x/i.test(entity)) return String.fromCodePoint(parseInt(entity.slice(3, -1), 16));
    if (/^&#/.test(entity)) return String.fromCodePoint(parseInt(entity.slice(2, -1), 10));
    return entity;
  });

/**
 * Converts the body of a (simple, table-based) email to a readable plain-text
 * alternative. Links keep their URL; mailto/tel links keep their label only.
 */
export function htmlToText(html) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, '')
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const plain = label.replace(/<[^>]+>/g, '').trim();
      if (/^(mailto|tel):/i.test(href) || !plain) return plain;
      return plain === href ? href : `${plain} (${href})`;
    })
    .replace(/<\/(p|div|h[1-6]|tr|table|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, ': ')
    .replace(/<[^>]+>/g, '');

  return decode(text)
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
