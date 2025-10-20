const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, '..', 'curl_output.html');
const outputFilePath = path.join(__dirname, '..', 'src', 'data', 'mockEvents.json');

const fetchData = async () => {
  try {
    const html = fs.readFileSync(inputFilePath, 'utf8');
    const $ = cheerio.load(html);
    console.log('Successfully loaded HTML from curl_output.html.');

    let allEvents = [];

    // --- Logic 1: Structured tables (mostly past events) ---
    const eventTables = $('table.table1-2');
    console.log(`Found ${eventTables.length} tables.`);
    eventTables.each((i, table) => {
      const yearHeader = $(table).find('thead tr th').first().text();
      const yearMatch = yearHeader.match(/(\d{4})/);
      if (!yearMatch) return;
      const currentYear = yearMatch[0];

      $(table).find('tbody tr').each((j, row) => {
        if (j === 0) return;
        const columns = $(row).find('td');
        if (columns.length > 3) {
          const dateText = $(columns[0]).text().trim();
          const name = $(columns[1]).text().trim().replace(/\n/g, ' ');
          const location = $(columns[2]).text().trim();
          const venue = $(columns[3]).text().trim();

          if (name && dateText) {
            const dateMatch = dateText.match(/(\d+)月(\d+)日/);
            if (dateMatch) {
              const month = dateMatch[1].padStart(2, '0');
              const day = dateMatch[2].padStart(2, '0');
              let eventYear = parseInt(currentYear);
              if (parseInt(month) < 4) { eventYear += 1; }
              const startDate = `${eventYear}-${month}-${day}`;
              allEvents.push({ dateText, startDate, name, location: `${location} ${venue}`.trim() });
            }
          }
        }
      });
    });
    console.log(`Extracted ${allEvents.length} events from tables.`);

    // --- Logic 2: Unstructured divs (all sections) ---
    let divEventsCount = 0;
    $('div.shadow_box').each((i, box) => {
      const h3 = $(box).find('h3.mttl_bl');
      if (!h3.length) return;

      const dateText = h3.html().split('<br>')[0].trim();
      const name = h3.text().replace(dateText, '').trim().replace(/\n/g, ' ');

      let location = '';
      $(box).find('p').each((k, p) => {
        if ($(p).text().includes('開催地：')) {
          location = $(p).text().replace('開催地：', '').trim();
        }
      });

      // 修正: 日付の正規表現をUnicodeの異なる「月」「日」文字に対応させる
      // U+6708 (月), U+2F6B (⽉)  / U+65E5 (日), U+2F6E (⽇)
      const dateRegex = /(\d{4})年\s*(\d+)\s*[月⽉]\s*(\d+)\s*[日⽇]/u; // 'u' flag for Unicode property escapes
      const dateMatch = dateText.match(dateRegex);

      if (name && location && dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2].padStart(2, '0');
        const day = dateMatch[3].padStart(2, '0');
        const startDate = `${year}-${month}-${day}`;
        allEvents.push({ dateText, startDate, name, location });
        divEventsCount++;
      }
    });
    console.log(`Extracted ${divEventsCount} events from divs.`);

    // --- Deduplication and Sorting ---
    const uniqueEvents = Array.from(new Map(allEvents.map(event => [`${event.name}_${event.startDate}`, event])).values());
    uniqueEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const finalEvents = uniqueEvents.map((event, index) => ({ id: index + 1, ...event }));

    console.log(`Successfully extracted a total of ${finalEvents.length} unique events.`);

    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(finalEvents, null, 2), 'utf-8');
    console.log(`Event data successfully saved to ${outputFilePath}`);

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

fetchData();
