# Seb Porral — portfolio site

Static site (HTML/CSS/JS, no build step) hosted on GitHub Pages, edited through Sveltia CMS at `/admin`.

## Folder map

```
index.html          Projects (homepage)
project.html        One project page — opened as project.html?p=<project-name>
photography.html    Photo gallery with full-screen viewer
about.html          About
contact.html        Contact
css/style.css       All styling (colours/sizes at the top, under "Tokens")
js/common.js        Header, footer, gallery and shared helpers
js/*.js             One script per page
content/            Everything the admin edits (JSON files)
  projects/         One file per project
images/uploads/     Uploaded images (placeholders for now)
admin/              Sveltia CMS (index.html + config.yml)
```

## 1. Put it on GitHub

1. Create a new **public** repo on the `junedmto` account called **`seb`**.
2. Upload the *contents* of this folder (so `index.html` sits at the top level of the repo, not inside a `seb` folder). Include the hidden `.nojekyll` file.
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. After a minute or two the site is live at **https://junedmto.github.io/seb/**

## 2. Signing in to the admin

1. Go to **https://junedmto.github.io/seb/admin/**
2. Click **Sign In with Token**. The dialog links to GitHub's token page with the right permissions preselected.
   - Fine-grained token: give it access to the `seb` repo with **Contents: Read and write**.
   - Set an expiry you're comfortable with; when it expires, just make a new one.
3. Paste the token. The browser remembers it.

For Seb to use the admin while it's on your account: repo → **Settings → Collaborators** → add him. He then creates his own token the same way.

## 3. Using the admin

- **Projects** → New Project: title, YouTube link (normal link is fine), cover image, description, gallery photos (select many at once), images per row.
- **Site → Homepage**: add the new project to the list so it appears on the homepage, and drag to reorder.
- **Site → Photography / About page / Contact page / Site settings**: everything else, including social links.
- Uploads are automatically converted to WebP and scaled to max 2400px.
- Saving publishes automatically; the live site updates within a couple of minutes.

## 4. Handing the site over to Seb

1. Repo → **Settings → General → Transfer ownership** → transfer to Seb's GitHub account.
2. In `admin/config.yml`, change `repo: junedmto/seb` to `repo: <his-account>/seb`, and update `site_url` / `display_url`.
3. He re-enables Pages in his repo settings if needed, and signs in to the admin with his own token.
4. Custom domain (optional): repo → Settings → Pages → Custom domain, plus DNS records at his domain registrar.

## Previewing locally

The pages load their content with JavaScript, so opening the files directly won't work. From the folder that *contains* `seb`, run `python3 -m http.server` and open http://localhost:8000/seb/
