import fs from 'fs';
import { join } from 'path';
import { chromium, Page } from 'playwright';

async function getPageContent(page: Page) {
  const title = await page.$eval(
    '.jss2 .MuiTypography-root.MuiTypography-h1',
    (h1) => {
      h1.children?.[0]?.remove?.();
      const titleText = h1.textContent;
      return titleText.trim();
    }
  );

  const verses = await page.$$eval('.jss2 p', (pNodes) => {
    return pNodes.reduce((verses, p, index, array) => {
      if (index === array.length - 1) return verses;
      return { ...verses, [index + 1]: p.textContent };
    }, {});
  });

  return { title, verses };
}

async function getNextPageLink(page: Page) {
  return page.$eval('button[aria-label=next] a', (a) => a.getAttribute('href'));
}

function saveJsonFile(filename: string, object: object) {
  fs.writeFileSync(join(__dirname, filename), JSON.stringify(object, null, 2));
}

async function main() {
  const initialPageLink = 'https://www.bibliaonline.com.br/ara/gn/1';

  const startTime = new Date();
  console.log(`Navegando para ${initialPageLink}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(initialPageLink);

  const bible: Record<
    string,
    { title: string; verses: Record<string, string> }
  > = {};

  process.on('SIGINT', async function () {
    const endTime = new Date();
    const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    saveJsonFile(`bible-incomplete-${time}.json`, bible);
    saveJsonFile(`info-${time}.json`, {
      startTime,
      endTime,
      durationInSeconds,
    });
    process.exit();
  });

  try {
    while (true) {
      const content = await getPageContent(page);
      const nextPageLink = await getNextPageLink(page);
      bible[content.title] = content;
      // if (Object.keys(bible).length === 10) break; // break after n chapters
      if (nextPageLink === initialPageLink) break;
      console.log(`Navegando para ${nextPageLink}`);
      await page.goto(nextPageLink);
    }
  } catch (e) {
    console.log(e);
  }

  const endTime = new Date();
  const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

  const time = endTime.getTime();
  saveJsonFile(`bible-ara-${time}.json`, bible);
  saveJsonFile(`info-${time}.json`, {
    startTime,
    endTime,
    durationInSeconds,
  });
  await browser.close();
}

main();
