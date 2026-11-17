const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Parses the article Markdown subset into blocks:
 * h2 / h3 (with ids for the contents list), p, ul, ol, quote and figure.
 */
export function parseArticle(markdown) {
  const blocks = [];
  const ids = new Set();
  let current = null;
  const flush = () => {
    if (!current) return;
    blocks.push(current.items ? { type: current.type, items: current.items } : { type: current.type, text: current.lines.join(' ') });
    current = null;
  };
  const begin = (type) => {
    if (current?.type === type) return;
    flush();
    current = type === 'ul' || type === 'ol' ? { type, items: [] } : { type, lines: [] };
  };
  const uniqueId = (text) => {
    const base = slugify(text) || 'section';
    let id = base;
    for (let n = 2; ids.has(id); n += 1) id = `${base}-${n}`;
    ids.add(id);
    return id;
  };

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    let m;
    if (!line) {
      flush();
    } else if ((m = /^(#{2,3})\s+(.+)$/.exec(line))) {
      flush();
      blocks.push({ type: m[1].length === 2 ? 'h2' : 'h3', text: m[2], id: uniqueId(m[2]) });
    } else if ((m = /^!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)$/.exec(line))) {
      flush();
      blocks.push({ type: 'figure', alt: m[1], src: m[2], caption: m[3] });
    } else if ((m = /^>\s?(.*)$/.exec(line))) {
      begin('quote');
      current.lines.push(m[1]);
    } else if ((m = /^[-*]\s+(.+)$/.exec(line))) {
      begin('ul');
      current.items.push(m[1]);
    } else if ((m = /^\d+[.)]\s+(.+)$/.exec(line))) {
      begin('ol');
      current.items.push(m[1]);
    } else if (current?.items) {
      // A wrapped list item: the line continues the item above it.
      current.items[current.items.length - 1] += ` ${line}`;
    } else {
      begin('p');
      current.lines.push(line);
    }
  }
  flush();
  return blocks;
}
