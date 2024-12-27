# codingap.dev Development

The development side of things for my website, https://codingap.dev/. This contains all the source code for hosting my website with blog posts, projects, everything.

#### by AP

##### Last updated 12/27/2024

## How to use

Clone this repo, use `deno task dev` to run the website (no options for optimized builds, but shouldn't need them)

## Features

- Main page with portfolio and links to projects
- Blog that is generated from Markdown files
- About page with all my information

## To-Do List
- Embedded projects
- CMS for blogs and projects
- Subdomains

## Open Source Libraries

It currently uses:

- [steve](https://jsr.io/@codingap/steve) for server-side rendering.
- [markdown](https://jsr.io/@libs/markdown) for converting Markdown files to HTML.
- [deno-dom](https://jsr.io/@b-fuze/deno-dom) for parsing HTML.