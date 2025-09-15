/**
 * src/posts.ts
 *
 * this is a temporary solution to the blog as i construct the cms
 * 
 * this was how i stored and accessed the posts, rendered with steve and lib/markdown 
 *
 * by alex prosser
 * 9/15/2025
 */

import { DOMParser } from '@b-fuze/deno-dom';
import { STEVE } from '@codingap/steve';
import { Renderer } from '@libs/markdown';
import directives, { directive, h } from '@libs/markdown/plugins/directives';
import frontmatter from '@libs/markdown/plugins/frontmatter';
import highlighting from '@libs/markdown/plugins/highlighting';
import { walk } from '@std/fs';
import { unescape } from '@std/html';
import { basename, join, relative, resolve } from '@std/path';

interface PostData {
    title: string;
    author: string;
    date: string;
}

const custom = directive((node) => {
    // allows items to be centered in markdown
    if (node.type === 'containerDirective' && node.name === 'center') {
        node.data ??= {};
        node.data.hName = 'div';
        node.data.hProperties =
            h(node.data.hName, { style: 'text-align: center;' }).properties;
    }

    // adds images from the static directory
    if (node.type === 'leafDirective' && node.name === 'image') {
        node.data ??= {};
        const src = node.attributes?.src ?? '';
        const style = node.attributes?.style ?? '';

        if (!src) {
            throw new Error("The 'image' markdown requires a 'url' attribute.");
        }

        node.data.hName = 'div';
        node.data.hProperties =
            h('div', { style: 'text-align: center; padding-bottom: 20px;' }).properties;
        node.data.hChildren = [
            {
                type: 'element',
                tagName: 'img',
                properties: {
                    src: join('/static', src),
                    style,
                },
                children: [],
            },
        ];
    }
});

const customRenderer = new Renderer({
    plugins: [frontmatter, highlighting, directives, custom],
});

const convertMarkdown = async (
    content: string,
): Promise<{ data: PostData; content: string; textOnly: string }> => {
    const { value: parsedFile, metadata } = await customRenderer.render(
        content,
        { metadata: true },
    );

    const unescaped = unescape(parsedFile);
    return {
        data: metadata.frontmatter as PostData,
        content: STEVE.render(unescaped, {}),
        textOnly: new DOMParser().parseFromString(unescaped, 'text/html').body.innerText,
    };
};

const currentDirectory = resolve('./');

const posts: { name: string; data: { [key: string]: string } }[] = [];
const postDirectory = join(currentDirectory, 'posts');
for await (const post of walk(postDirectory)) {
    if (post.isFile) {
        const filename = relative(postDirectory, post.path);
        const textContent = await Deno.readTextFile(post.path);
        const { data, content, textOnly } = await convertMarkdown(textContent);

        posts.push({
            name: basename(filename, '.md').replace(/\//g, '.'),
            data: { content, textOnly, ...data },
        });
    }
}

posts.sort((a, b) => {
    return new Date(b.data.date).getTime() -
        new Date(a.data.date).getTime();
});

export default posts;