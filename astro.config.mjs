import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Shouts at the end of a build if anything is still carrying a placeholder.
 * A code of conduct with a dead reporting address is worse than no code of
 * conduct, and it is exactly the kind of thing that ships unnoticed.
 */
function placeholderCheck() {
  return {
    name: 'dice-and-tale:placeholder-check',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const found = [];
        const walk = d => {
          for (const e of readdirSync(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.html')) {
              const html = readFileSync(p, 'utf8');
              if (html.includes('REPLACE-ME')) found.push(p.replace(dir.pathname, ''));
              if (html.includes('TODO —')) found.push(p.replace(dir.pathname, '') + ' (TODO alt text)');
            }
          }
        };
        walk(dir.pathname);
        if (found.length) {
          logger.warn('');
          logger.warn('  ⚠  PLACEHOLDERS STILL IN THE BUILD — do not put this in front of people:');
          found.forEach(f => logger.warn(`     ${f}`));
          logger.warn('     Fix src/pages/code-of-conduct.astro before going public.');
          logger.warn('');
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://diceandtale.com',
  integrations: [sitemap(), placeholderCheck()],
  build: { inlineStylesheets: 'always' },
});
