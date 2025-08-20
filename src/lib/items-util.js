// src/lib/items-util.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function itemsDir(type) {
  return path.join(process.cwd(), 'src/data', type);
}

export function getItemsFiles(type) {
  const dir = itemsDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

export function getItemData(itemIdentifier, type) {
  // 🔹 Skip markdown loading for services
  if (type === 'services') {
    return {
      slug: itemIdentifier.replace(/\.[^/.]+$/, ''), // remove any ext
    };
  }

  const itemsDirectory = itemsDir(type);
  const itemSlug = itemIdentifier.replace(/\.(mdx?|js|ts)$/, '');
  const filePathMd = path.join(itemsDirectory, `${itemSlug}.md`);
  const filePathMdx = path.join(itemsDirectory, `${itemSlug}.mdx`);
  const filePath = fs.existsSync(filePathMd)
    ? filePathMd
    : fs.existsSync(filePathMdx)
    ? filePathMdx
    : null;

  if (!filePath) {
    throw new Error(`Markdown file not found for "${itemSlug}" in ${itemsDirectory}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug: itemSlug,
    ...data,
    content,
  };
}

export function getAllItems(type) {
  const itemFiles = getItemsFiles(type);
  const allItems = itemFiles.map((itemFile) => getItemData(itemFile, type));

  // Sort by date if present
  return allItems.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getFeaturedItems(items) {
  return items.filter((item) => item.isFeatured);
}
