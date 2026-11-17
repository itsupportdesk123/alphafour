import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

const DEFAULT_TEMPLATES_DIR = fileURLToPath(new URL('../templates/', import.meta.url));

/**
 * Repository for email templates stored on disk (Handlebars).
 * Loads partials and layouts once, compiles templates lazily and caches them.
 */
export class TemplateRepository {
  constructor({ templatesDir = DEFAULT_TEMPLATES_DIR, logger } = {}) {
    this.templatesDir = templatesDir;
    this.logger = logger?.child({ layer: 'repository', repository: 'template' });
    this.hbs = Handlebars.create();
    this.cache = new Map();
    this.initialised = null;
    registerHelpers(this.hbs);
  }

  /** Registers all partials once. Safe to call repeatedly. */
  init() {
    this.initialised ??= (async () => {
      const partialsDir = path.join(this.templatesDir, 'partials');
      const files = await readdir(partialsDir).catch(() => []);
      for (const file of files.filter((f) => f.endsWith('.hbs'))) {
        const source = await readFile(path.join(partialsDir, file), 'utf8');
        this.hbs.registerPartial(path.basename(file, '.hbs'), source);
      }
    })();
    return this.initialised;
  }

  async #compile(relativePath) {
    await this.init();
    if (this.cache.has(relativePath)) return this.cache.get(relativePath);
    const source = await readFile(path.join(this.templatesDir, relativePath), 'utf8');
    const template = this.hbs.compile(source, { strict: false });
    this.cache.set(relativePath, template);
    return template;
  }

  /** Renders a body template, e.g. render('enquiry-confirmation', context). */
  async render(name, context) {
    const template = await this.#compile(`${name}.hbs`);
    return template(context);
  }

  /** Renders a layout around an already-rendered body. */
  async renderLayout(name, context) {
    const template = await this.#compile(path.join('layouts', `${name}.hbs`));
    return template(context);
  }

  /** Lists the available body templates (used by tests and diagnostics). */
  async list() {
    const files = await readdir(this.templatesDir);
    return files.filter((f) => f.endsWith('.hbs')).map((f) => path.basename(f, '.hbs'));
  }
}

function registerHelpers(hbs) {
  hbs.registerHelper('nl2br', (value) => {
    const escaped = hbs.escapeExpression(String(value ?? ''));
    return new hbs.SafeString(escaped.replace(/\n/g, '<br>'));
  });
  hbs.registerHelper('stars', (rating) => {
    const n = Math.max(0, Math.min(5, Number(rating) || 0));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  });
  hbs.registerHelper('eq', (a, b) => a === b);
  // The last argument Handlebars passes is the options object, so drop it.
  hbs.registerHelper('concat', (...args) => args.slice(0, -1).map((v) => (v == null ? '' : String(v))).join(''));
  hbs.registerHelper('telHref', (phone) => String(phone ?? '').replace(/[^\d+]/g, ''));
}
