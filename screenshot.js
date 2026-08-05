const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outputDir = '/Users/samuelrussell/Desktop/Jimbos-Nursery/public/images/uploads';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to site...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // 1. Hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outputDir}/screenshot_hero.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Hero screenshot saved');

  // 2. Services
  await page.evaluate(() => {
    const el = document.querySelector('#services');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outputDir}/screenshot_services.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Services screenshot saved');

  // 3. Spring Collection (dark seasonal section)
  await page.evaluate(() => window.scrollBy(0, 2200));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outputDir}/screenshot_spring.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Spring Collection screenshot saved');

  // 4. Events
  await page.evaluate(() => {
    const el = document.querySelector('#events');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outputDir}/screenshot_events.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Events screenshot saved');

  // 5. Archive CTA
  await page.evaluate(() => {
    const el = document.querySelector('#inventory');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outputDir}/screenshot_archive.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Archive screenshot saved');

  // 6. Footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${outputDir}/screenshot_footer.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Footer screenshot saved');

  await browser.close();
  console.log('All screenshots complete!');
})();
