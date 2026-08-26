# How to Add a New Project to the Website

This guide walks through adding a project to the Gallery, start to finish, on
Windows. No coding tools needed — just File Explorer and Notepad (or any text
editor).

Every project on the site is simply **a folder containing photos and one text
file** (`project.json`) that describes them. The website reads these folders
automatically — add a folder, list it in one place, and the project appears.

---

## Where projects live

All projects are inside the website files at:

```
website\assets\projects\
```

Inside you'll find one folder per project, plus two special items:

```
assets\projects\
│   projects.json              ← the master list of projects (display order)
│   HOW-TO-ADD-A-PROJECT.md    ← this guide
├── _TEMPLATE\                 ← a starter project.json to copy from
├── harrington-park\           ← an example project
│       project.json
│       01-living.jpg
│       02-lounge.jpg
│       ...
└── ...
```

---

## Step 1 — Prepare the photos

1. Pick the photos for the project. Aim for **3–8 photos**.
2. **Resize them before uploading.** Camera originals are huge (5–15 MB each)
   and will make the site slow. Photos should be:
   - **2000 pixels** on the longest edge (plenty for full-screen viewing)
   - Saved as **JPG**, quality around 80%
   - Ideally **under 600 KB** per photo

   An easy free way on Windows: select the photos in File Explorer →
   right-click → **Resize pictures** (if you have Microsoft PowerToys
   installed), choose Large or a custom 2000px size. Or use any photo editor,
   or a site like squoosh.app (drag photo in, drag quality to ~80, save).

3. Rename the files so they sort in the order you want them shown, with a
   number in front and a short description:

   ```
   01-living-room.jpg
   02-kitchen.jpg
   03-master-bedroom.jpg
   ```

   **Filename rules (important):** lowercase letters, numbers and hyphens
   only. No spaces, no capital letters, no special characters.
   `01-living-room.jpg` ✔ — `Living Room (1).JPG` ✘

## Step 2 — Create the project folder

1. Open `website\assets\projects\` in File Explorer.
2. Create a new folder. The folder name becomes part of the project's web
   address, so use the same rules: **lowercase, hyphens instead of spaces**.

   Examples: `bella-vista-penthouse`, `glenmore-park-reno`, `manly-beach-house`

3. Copy your prepared photos into it.

## Step 3 — Create the project.json file

1. Open the `_TEMPLATE` folder, copy the `project.json` file inside it, and
   paste it into your new project folder.
2. Right-click it → **Open with** → **Notepad** (or your preferred editor).
3. Fill in each field. Here's what they mean:

   | Field | What it does |
   |---|---|
   | `title` | Project name shown on the site, e.g. `"Bella Vista Penthouse"` |
   | `category` | Which gallery filter it appears under. Must be exactly one of: `living`, `colour`, `wallpaper`, `organisation` |
   | `categoryLabel` | The pretty version shown to visitors, e.g. `"Living Spaces"`, `"Colour & Finishes"` |
   | `location` | Suburb, e.g. `"Bella Vista, NSW"` |
   | `year` | Year completed, e.g. `"2026"` |
   | `cover` | The filename of the photo used on the gallery tile, e.g. `"01-living-room.jpg"` |
   | `summary` | One–two sentences under the title and on the gallery tile |
   | `brief` | The opening paragraphs about the project (the client, the brief, the approach) |
   | `photos` | The photo-by-photo story: each photo with a heading and paragraph |

4. **JSON formatting rules** — the file is picky about punctuation, so:
   - Every piece of text sits in `"double quotes"`
   - Items in a list are separated by commas — but there is **no comma after
     the last item** in a list
   - Don't delete the `{ } [ ]` brackets, just the content between them
   - If you need a quotation mark *inside* your text, type it as `\"`
   - Apostrophes (like *owner's*) are fine as-is

   A complete example:

   ```json
   {
     "title": "Bella Vista Penthouse",
     "category": "living",
     "categoryLabel": "Living Spaces",
     "location": "Bella Vista, NSW",
     "year": "2026",
     "cover": "01-living-room.jpg",
     "summary": "A top-floor apartment restyled around its skyline views.",
     "brief": [
       "First paragraph about the project.",
       "Second paragraph — note the comma after the first one, and none after this last one."
     ],
     "photos": [
       {
         "image": "01-living-room.jpg",
         "heading": "The Living Room",
         "text": "A paragraph about this photo."
       },
       {
         "image": "02-kitchen.jpg",
         "heading": "The Kitchen",
         "text": "A paragraph about this photo. No comma after this block because it's the last one."
       }
     ]
   }
   ```

5. **Check your JSON before uploading** (recommended): go to
   **jsonlint.com**, paste the whole file in, and click Validate. It will
   point at the exact line if a comma or quote is wrong. If the file has an
   error, that one project simply won't appear on the site — the rest of the
   site is unaffected.

## Step 4 — Add the project to the master list

1. In `website\assets\projects\`, open `projects.json` in Notepad.
2. Add your new folder's name to the list. **The order here is the order
   projects appear in the gallery** — first in the list = first on the page.

   ```json
   {
     "projects": [
       "bella-vista-penthouse",
       "harrington-park",
       "camden-farmhouse",
       "oran-park-townhome",
       "narellan-wardrobe"
     ]
   }
   ```

   Same comma rule: commas between names, no comma after the last one.

To **remove** a project from the site, just delete its line from this list
(the folder can stay — it simply won't be shown). To **reorder** projects,
reorder the lines.

## Step 5 (optional) — Refresh the offline preview

The live website reads your JSON files directly, so this step is **not
required for the site to work**. But if you preview the site by
double-clicking `index.html` (opening it straight from the file system),
browsers block the site from reading the JSON files, so it uses a saved
snapshot instead — `projects-data.js` in this folder.

To refresh that snapshot after adding or editing projects (needs Node.js
installed): open this folder in File Explorer, click the address bar, type
`cmd` and press Enter, then run:

```
node rebuild-preview-data.js
```

It prints a line per project and rewrites `projects-data.js`. If you skip
this, the live site is unaffected — only the double-click preview shows the
older data.

## Step 6 — Make it live

*(This section will be completed once hosting is set up. The short version:
upload the new/changed files in `assets\projects\` to the same location on
the web host, replacing what's there. Nothing else on the site needs to be
touched.)*

---

## Quick checklist

- [ ] Photos resized (~2000px, JPG, under ~600 KB each)
- [ ] Filenames: lowercase, numbers first, hyphens, no spaces
- [ ] Folder name: lowercase with hyphens
- [ ] `project.json` copied from `_TEMPLATE` and filled in
- [ ] `cover` matches one of the photo filenames exactly
- [ ] `category` is one of: `living`, `colour`, `wallpaper`, `organisation`
- [ ] JSON checked at jsonlint.com
- [ ] Folder name added to `projects.json`
- [ ] (Optional) `node rebuild-preview-data.js` run to refresh the offline preview
- [ ] (Optional) `node rebuild-sitemap.js` run so search engines learn about the new project page
- [ ] Uploaded to the host
