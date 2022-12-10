import fs from 'fs';
import path from 'path';
// @ts-ignore
import bible from './bible-ara.json';

const chapters = Object.keys(bible)

const books = chapters.reduce((acc, chapter) => {
  const bookName = chapter.replace(/(\d\s)?(.*)(\s\d{1,3})/, '$1$2');
  const chapterNumber = chapter.replace(/(\d\s)?(.*)(\s\d{1,3})/, '$3').trim();
  const { verses } = bible[chapter];

  if (!(bookName in acc)) {
    acc[bookName] = {}
  } 
  const bookReference = acc[bookName];
  bookReference[chapterNumber] = verses;

  return acc
}, {} as Record<string, any>)

const booksNames = Object.keys(books);

// console.log(books['João'][3][16])

const destinationFolder = path.resolve(__dirname, 'ARA');

if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

for (const bookName of booksNames) {
  const book = books[bookName];
  const bookJSON = JSON.stringify(book, null, 2);
  const filePath = path.resolve(destinationFolder, `${bookName}.json`);
  fs.writeFileSync(filePath, bookJSON);
}
