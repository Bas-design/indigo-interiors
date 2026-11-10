/* Regenerates ../../sitemap.xml from the static pages plus every project
   in projects.json. Run alongside rebuild-preview-data.js after adding or
   removing a project (needs Node.js):
       node rebuild-sitemap.js
   Change DOMAIN here (and in robots.txt + the og:/canonical tags in each
   HTML file) if the site's domain differs at go-live. */
'use strict';
var fs = require('fs');
var path = require('path');

var DOMAIN = 'https://indigointeriors.com.au';

var here = __dirname;
var list = JSON.parse(fs.readFileSync(path.join(here, 'projects.json'), 'utf8'));

var urls = [
  { loc: '/', priority: '1.0' },
  { loc: '/services.html', priority: '0.8' },
  { loc: '/gallery.html', priority: '0.8' },
  { loc: '/contact.html', priority: '0.8' }
];
list.projects.forEach(function (slug) {
  urls.push({ loc: '/projects/' + slug + '/', priority: '0.6' });
});

var today = new Date().toISOString().slice(0, 10);
var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(function (u) {
    return '  <url>\n' +
      '    <loc>' + DOMAIN + u.loc.replace(/&/g, '&amp;') + '</loc>\n' +
      '    <lastmod>' + today + '</lastmod>\n' +
      '    <priority>' + u.priority + '</priority>\n' +
      '  </url>';
  }).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(here, '..', '..', 'sitemap.xml'), xml);
console.log('wrote sitemap.xml (' + urls.length + ' URLs)');
