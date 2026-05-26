# BataKita.

Static MVP landing page for `batakita.halugoods.com`.

## Deploy Target

- Hosting: GitHub Pages
- Custom domain: `batakita.halugoods.com`
- DNS target: CNAME to `<github-username>.github.io`

## Required GitHub Pages Settings

1. Push this folder to a GitHub repository.
2. Enable GitHub Pages from the repository's default branch.
3. Set custom domain to `batakita.halugoods.com`.
4. Keep the included `CNAME` file in the published root.

## Required Cloudflare DNS

Create a DNS record:

- Type: `CNAME`
- Name: `batakita`
- Target: `<github-username>.github.io`
- Proxy status: DNS only while GitHub Pages verifies the domain

