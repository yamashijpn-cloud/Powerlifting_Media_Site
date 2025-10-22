const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = 'https://www.openipf.org/';
const debugOutputFilePath = path.join(__dirname, '..', 'debug', 'data', 'rankings.json');
const appOutputFilePath = path.join(__dirname, '..', 'src', 'data', 'rankings.json');

// IPF Weight Classes
const menWeightClasses = [59, 66, 74, 83, 93, 105, 120];
const womenWeightClasses = [47, 52, 57, 63, 69, 76, 84];

/**
 * Determines the weight class based on gender and bodyweight.
 * @param {string} gender - The lifter's gender ('M' or 'F').
 * @param {number} bodyweight - The lifter's bodyweight in kg.
 * @returns {string} The corresponding weight class string (e.g., "-74kg").
 */
const getWeightClass = (gender, bodyweight) => {
  if (!gender || !bodyweight) return '';

  const classes = gender === 'M' ? menWeightClasses : womenWeightClasses;
  const superHeavyClass = gender === 'M' ? '120kg超級' : '84kg超級';

  for (const wc of classes) {
    if (bodyweight <= wc) {
      return `${wc}kg級`;
    }
  }
  return superHeavyClass;
};

const fetchRankings = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Try to find and click the "Rankings" link by its text content
    console.log('Trying to find "Rankings" link by text content...');
    const rankingsLinkHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const rankingLink = links.find(link => link.innerText.includes('Rankings'));
      return rankingLink ? rankingLink.href : null;
    });

    if (rankingsLinkHref) {
      console.log('Found Rankings link, navigating to it...');
      await page.goto(rankingsLinkHref, { waitUntil: 'networkidle2' });
      console.log(`Navigated to ${page.url()}`);
    } else {
      console.log('Rankings link not found by text content. Trying direct URL...');
      // Fallback to a common rankings URL pattern if link not found
      await page.goto('https://www.openipf.org/rankings', { waitUntil: 'networkidle2' });
      console.log(`Navigated to ${page.url()}`);
    }

    // --- Now on the rankings page (hopefully) ---
    console.log('Extracting rankings data...');
    let allRankingsMap = new Map(); // Use a Map to store unique lifters by name, prioritizing higher GL points
    const targetRankingsCount = 100;
    const maxAttempts = 10; // Limit to prevent infinite loops

    // Initial extraction from initial_data (first 100 rows)
    const initialRankingsData = await page.evaluate(() => {
      if (typeof initial_data !== 'undefined' && initial_data.rows) {
        return initial_data.rows;
      }
      return [];
    });

    initialRankingsData.forEach(row => {
      const lifterName = row[2];
      const glPoints = parseFloat(row[23]); // Assuming glPoints is at index 23 for initial_data
      const rawGender = row[13]; // Corrected index for gender in initial_data
      const bodyweight = parseFloat(row[17]); // Corrected index for bodyweight in initial_data

      if (lifterName && !isNaN(glPoints) && glPoints > 50) { // Filter out malformed entries
        const existingLifter = allRankingsMap.get(lifterName);
        const gender = rawGender === '男' ? 'M' : (rawGender === '女' ? 'F' : null);
        const weightClass = getWeightClass(gender, bodyweight);

        if (!existingLifter || glPoints > existingLifter.glPoints) {
          allRankingsMap.set(lifterName, {
            id: String(row[0]), // Ensure ID is string for consistency
            lifterName: lifterName,
            gender: gender,
            country: row[6],
            equipment: row[16],
            weightClass: weightClass,
            bodyweight: bodyweight,
            squat: parseFloat(row[19]),
            bench: parseFloat(row[20]),
            deadlift: parseFloat(row[21]),
            total: parseFloat(row[22]),
            glPoints: glPoints,
          });
        }
      }
    });
    console.log(`Initial unique rankings collected: ${allRankingsMap.size}`);

    let previousMapSize = allRankingsMap.size;

    for (let i = 0; i < maxAttempts; i++) {
      // Attempt to trigger data loading via SlickGrid's DataView if available
      const newRowsLoaded = await page.evaluate(() => {
        // Check if SlickGrid's DataView is globally accessible
        if (window.dataView && typeof window.dataView.getLength === 'function') {
          const initialLength = window.dataView.getLength();
          // Attempt to scroll or trigger a load more event within SlickGrid
          // This is highly speculative and depends on how the specific SlickGrid instance is configured
          const viewport = document.querySelector('.slick-viewport');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight; // Scroll to trigger potential load
          }
          // Give some time for data to load
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(window.dataView.getLength() > initialLength);
            }, 2000);
          });
        }
        return false;
      });

      if (!newRowsLoaded && i > 0) {
        console.log('No new rows loaded via DataView manipulation. Stopping.');
        break;
      }

      // Re-extract from DOM after potential data load
      const domRows = await page.evaluate(() => {
        const data = [];
        const slickRows = document.querySelectorAll('.slick-row');
        slickRows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('.slick-cell'));
          const rowData = cells.map(cell => cell.innerText.trim());
          data.push(rowData);
        });
        return data;
      });

      domRows.forEach(row => {
        const lifterName = row[2];
        const glPoints = parseFloat(row[15]); // Assuming glPoints is at index 15 for DOM extracted rows
        const rawGender = row[6]; // Corrected index for gender in DOM rows
        const bodyweight = parseFloat(row[10]); // Corrected index for bodyweight in DOM rows

        if (lifterName && !isNaN(glPoints) && glPoints > 50) { // Filter out malformed entries
          const existingLifter = allRankingsMap.get(lifterName);
          const gender = rawGender === '男' ? 'M' : (rawGender === '女' ? 'F' : null);
          const weightClass = getWeightClass(gender, bodyweight);

          if (!existingLifter || glPoints > existingLifter.glPoints) {
            allRankingsMap.set(lifterName, {
              id: String(row[1]), // Ensure ID is string for consistency
              lifterName: lifterName,
              gender: gender,
              country: row[5],
              equipment: row[8],
              weightClass: weightClass,
              bodyweight: bodyweight,
              squat: parseFloat(row[11]),
              bench: parseFloat(row[12]),
              deadlift: parseFloat(row[13]),
              total: parseFloat(row[14]),
              glPoints: glPoints,
            });
          }
        }
      });

      console.log(`Attempt ${i + 1}. Total unique rankings collected: ${allRankingsMap.size}`);

      if (allRankingsMap.size >= targetRankingsCount) {
        console.log(`Reached target of ${targetRankingsCount} unique rankings.`);
        break;
      }

      if (allRankingsMap.size === previousMapSize && i > 0) {
        console.log('No new unique rankings loaded after attempts. Stopping.');
        break;
      }
      previousMapSize = allRankingsMap.size;
    }

    const rankings = Array.from(allRankingsMap.values()); // Convert Map values to an array

    if (rankings.length === 0) {
      console.log('No rankings data found from DOM extraction. Page content:');
      console.log(await page.content()); // Log page content for debugging
    }

    console.log(`Extracted ${rankings.length} rankings.`);

    const debugOutputDir = path.dirname(debugOutputFilePath);
    if (!fs.existsSync(debugOutputDir)) {
      fs.mkdirSync(debugOutputDir, { recursive: true });
    }
    fs.writeFileSync(debugOutputFilePath, JSON.stringify(rankings, null, 2), 'utf-8');
    console.log(`Rankings data successfully saved to ${debugOutputFilePath}`);

    const appOutputDir = path.dirname(appOutputFilePath);
    if (!fs.existsSync(appOutputDir)) {
      fs.mkdirSync(appOutputDir, { recursive: true });
    }
    fs.copyFileSync(debugOutputFilePath, appOutputFilePath);
    console.log(`Copied rankings data to ${appOutputFilePath}`);

  } catch (error) {
    console.error('An error occurred during ranking fetch:', error);
    if (browser) {
      const pages = await browser.pages();
      if (pages.length > 0) {
        console.log('Current page URL:', pages[0].url());
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

fetchRankings();