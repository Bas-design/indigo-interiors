/* Generates one real HTML page per project at /projects/<slug>/.

   Why this exists. Every project used to be served by the single
   project.html?p=<slug>, which meant all of them shipped the same
   <title>, the same description, and — worst — the same canonical URL
   pointing at /project.html. js/projects.js patched those in the
   browser, which Google usually picks up on its second rendering pass,
   but two things never got fixed:

     - the og: tags were never touched at all, so sharing a project link
       on Instagram, WhatsApp or Messenger previewed the generic site
       hero and the words "Project — Indigo Interiors" instead of the
       actual room;
     - every project declared the same canonical, inviting Google to
       treat four pages as one.

   Neither can be fixed inside one static file: a single file cannot
   carry four different og:image values. Hence a real page each.

   The markup is taken FROM project.html at generation time rather than
   copied into this script, so the header, footer and script tags stay
   defined in exactly one place. Edit project.html and re-run; the
   generated pages follow.

   Run from this folder (needs Node.js):
       node rebuild-project-pages.js

   Output:  website/projects/<slug>/index.html   (one per listed project)
   Stale folders for projects that no longer exist are removed. */
'use strict';

var fs = require('fs');
var path = require('path');

var here = __dirname;                              // assets/projects
var siteRoot = path.join(here, '..', '..');        // website/
var outRoot = path.join(siteRoot, 'projects');
var DOMAIN = 'https://indigointeriors.com.au';

/* The generated pages sit two levels down (/projects/<slug>/), so every
   relative path in the source markup needs lifting. Relative is kept
   rather than switching to root-relative so that opening the files
   straight from disk still works, same as the rest of the site. */
var PREFIX = '../../';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Trim to a sensible meta-description length on a word boundary. */
function clamp(s, max) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  var cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}

/* Lift relative href/src values by PREFIX. Absolute URLs, protocol-
   relative URLs, root-relative paths, anchors, mailto: and tel: are all
   left exactly as they are. */
function reRoot(html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, function (whole, attr, value) {
    if (/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(value)) return whole;
    return attr + '="' + PREFIX + value + '"';
  });
}

var template = fs.readFileSync(path.join(siteRoot, 'project.html'), 'utf8');
var list = JSON.parse(fs.readFileSync(path.join(here, 'projects.json'), 'utf8'));
var slugs = Array.isArray(list.projects) ? list.projects : [];

var written = [];
var skipped = [];

slugs.forEach(function (slug) {
  var p;
  try {
    p = JSON.parse(fs.readFileSync(path.join(here, slug, 'project.json'), 'utf8'));
  } catch (e) {
    skipped.push(slug + ' — ' + e.message);
    return;
  }

  var url = DOMAIN + '/projects/' + slug + '/';
  var title = (p.title || slug) + ' — Indigo Interiors';
  var desc = clamp(
    p.summary || ('A project by Indigo Interiors in ' + (p.location || 'Greater Sydney') + '.'),
    155
  );
  // The project's own cover photo, so a shared link previews the room
  // rather than the site's generic hero image.
  var image = p.cover
    ? DOMAIN + '/assets/projects/' + slug + '/' + p.cover
    : DOMAIN + '/assets/img/hero.jpg';

  var head =
    '<title>' + esc(title) + '</title>\n' +
    '<meta name="description" content="' + esc(desc) + '">\n' +
    '<link rel="canonical" href="' + esc(url) + '">\n' +
    '<meta property="og:type" content="article">\n' +
    '<meta property="og:site_name" content="Indigo Interiors">\n' +
    '<meta property="og:title" content="' + esc(title) + '">\n' +
    '<meta property="og:description" content="' + esc(desc) + '">\n' +
    '<meta property="og:url" content="' + esc(url) + '">\n' +
    '<meta property="og:image" content="' + esc(image) + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="twitter:title" content="' + esc(title) + '">\n' +
    '<meta name="twitter:description" content="' + esc(desc) + '">\n' +
    '<meta name="twitter:image" content="' + esc(image) + '">';

  var html = reRoot(template);

  // Swap the placeholder head metadata for this project's own.
  html = html
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace(/<link rel="canonical"[^>]*>\s*/, head + '\n');

  // Tell projects.js which project this is, and how far down it sits,
  // before it runs. Both reads are guarded, so root-level pages that
  // never define them are unaffected.
  html = html.replace(
    /<script src="[^"]*assets\/projects\/projects-data\.js"><\/script>/,
    '<script>window.INDIGO_PROJECT_SLUG = ' + JSON.stringify(slug) + ';' +
    ' window.INDIGO_BASE_PREFIX = ' + JSON.stringify(PREFIX) + ';</script>\n' +
    '$&'
  );

  html = html.replace(
    '<!-- Populated from assets/projects/<slug>/project.json by js/projects.js -->',
    '<!-- GENERATED by assets/projects/rebuild-project-pages.js — do not edit.\n' +
    '     Edit project.html (markup) or this project\'s project.json (content),\n' +
    '     then re-run the script. Body content is rendered by js/projects.js. -->'
  );

  var dir = path.join(outRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  written.push(slug);
});

/* Remove pages for projects that have been unlisted or deleted, so the
   site never serves a page the gallery no longer links to. */
var removed = [];
if (fs.existsSync(outRoot)) {
  fs.readdirSync(outRoot, { withFileTypes: true }).forEach(function (d) {
    if (d.isDirectory() && written.indexOf(d.name) === -1) {
      fs.rmSync(path.join(outRoot, d.name), { recursive: true, force: true });
      removed.push(d.name);
    }
  });
}

written.forEach(function (s) { console.log('ok:      projects/' + s + '/'); });
skipped.forEach(function (s) { console.warn('SKIPPED: ' + s); });
removed.forEach(function (s) { console.log('removed: projects/' + s + '/'); });
console.log('Wrote ' + written.length + ' project page(s).');
