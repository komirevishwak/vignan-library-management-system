const fs = require("fs");
const path = require("path");

const sourcePath = process.argv[2] || "C:\\Users\\vishwak\\Downloads\\insert_technical_books.sql";
const outputPath = process.argv[3] || path.resolve(process.cwd(), "supabase-technical-books-upsert.sql");
const source = fs.readFileSync(sourcePath, "utf8");
const valueRows = source.split(/\r?\n/).filter((line) => /^\('/.test(line)).length;
const openBooks = [...source.matchAll(/OPEN-(\d{3})/g)].map((match) => match[1]);
const uniqueOpenBooks = [...new Set(openBooks)].sort();

if (valueRows !== 130 || uniqueOpenBooks.length !== 31) {
  throw new Error(`Unexpected technical dataset: ${valueRows} rows and ${uniqueOpenBooks.length} OPEN rows`);
}

const withoutFinalSemicolon = source.replace(/;\s*$/, "");
const upsert = `${withoutFinalSemicolon}
ON CONFLICT (isbn) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  category = EXCLUDED.category,
  total_copies = EXCLUDED.total_copies,
  available_copies = EXCLUDED.available_copies,
  cover_url = EXCLUDED.cover_url,
  description = EXCLUDED.description,
  digital_reading_url = EXCLUDED.digital_reading_url,
  digital_access_note = EXCLUDED.digital_access_note;`;
const localCoverUpdates = uniqueOpenBooks
  .map((number) => `UPDATE public.books SET cover_url = '/book-covers/open-${number}.svg' WHERE isbn = 'OPEN-${number}';`)
  .join("\n");
const output = `-- Generated from ${sourcePath}
-- 130 rows currently present in the supplied file, upserted by unique ISBN.
BEGIN;
${upsert}

${localCoverUpdates}
COMMIT;
`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Prepared ${valueRows} rows with ${uniqueOpenBooks.length} local OPEN covers at ${outputPath}`);
