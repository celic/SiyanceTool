// Runs after `vite build`. GitHub Pages has no rewrite rules, so a direct
// visit to /mass-balance (a bookmark, a link from the teacher) would 404 —
// but Pages serves 404.html for unknown paths, and if that page is the app,
// React Router takes over and shows the right tool. So 404.html is a copy of
// index.html. Vite's own preview and dev servers do this rewrite themselves,
// which is why it only matters in the built output.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
