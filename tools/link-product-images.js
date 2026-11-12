#!/usr/bin/env node
/*
 * ساخت نقشه‌ی گالری تصاویر محصولات از روی فایل‌های موجود.
 * نام‌گذاری: images/products/<imageKey>-<شماره>.<پسوند>
 * پسوندهای پشتیبانی‌شده: webp, jpg, jpeg, png, avif, svg
 * شماره‌گذاری از 1 تا 50؛ هر محصول می‌تواند بین 1 تا 50 تصویر داشته باشد.
 * پس از افزودن/حذف عکس‌ها اجرا کنید: node tools/link-product-images.js
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'images', 'products');
const target = path.join(root, 'js', 'product-images.js');
const pattern = /^(.+)-(\d+)\.(webp|jpg|jpeg|png|avif|svg)$/i;
const map = {};
for (const file of fs.readdirSync(dir)) {
  const match = file.match(pattern);
  if (!match) continue;
  const number = Number(match[2]);
  if (!Number.isInteger(number) || number < 1 || number > 50) continue;
  (map[match[1]] ||= []).push({ number, path: `images/products/${file}` });
}
for (const key of Object.keys(map)) {
  map[key] = map[key].sort((a, b) => a.number - b.number).map(item => item.path);
}
let source = fs.readFileSync(target, 'utf8');
const block = `/*MAP-START*/\nconst MAP = ${JSON.stringify(map, null, 2)};\n/*MAP-END*/`;
if (/\/\*MAP-START\*\/[\s\S]*?\/\*MAP-END\*\//.test(source)) {
  source = source.replace(/\/\*MAP-START\*\/[\s\S]*?\/\*MAP-END\*\//, block);
} else {
  throw new Error('نشانگرهای MAP-START و MAP-END در js/product-images.js پیدا نشدند.');
}
fs.writeFileSync(target, source, 'utf8');
const count = Object.keys(map).length;
const total = Object.values(map).reduce((sum, images) => sum + images.length, 0);
console.log(`نقشه تصاویر به‌روز شد: ${count} محصول، ${total} تصویر (حداکثر ۵۰ تصویر برای هر محصول).`);
