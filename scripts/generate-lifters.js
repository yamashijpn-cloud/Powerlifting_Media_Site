const fs = require('fs');
const path = require('path');

const rankingsFilePath = path.join(__dirname, '..', 'src', 'data', 'rankings.json');
const liftersFilePath = path.join(__dirname, '..', 'src', 'data', 'lifters.json');

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

const generateLiftersData = async () => {
  try {
    console.log('Starting generateLiftersData...');
    const baseUrl = 'https://www.openipf.org/api/rankings';
    let allRankingsMap = new Map(); // Use a Map to store unique lifters by name, prioritizing higher GL points
    const targetRankingsCount = 300; // Target 300 lifters
    const fetchLimit = 100; // Fetch 100 lifters per API call

    console.log('Fetching rankings data via API...');
    // Removed gendersToFetch array and loop. Fetching from combined endpoint.
    for (let i = 0; ; i += fetchLimit) {
      const start = i;
      const end = i + fetchLimit - 1;
      const url = `${baseUrl}?start=${start}&end=${end}&lang=ja&units=kg`; // Modified URL
      console.log(`Attempting to fetch from: ${url}`);
      const response = await fetch(url);
      console.log(`Response status for ${url}: ${response.status}`);
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} for URL: ${url}`);
        break;
      }
      const data = await response.json();

      if (!data || !data.rows || data.rows.length === 0) {
        console.log(`No more data from API. Stopping.`); // Modified log message
        break;
      }

      data.rows.forEach(row => {
        const lifterName = row[2];
        const glPoints = parseFloat(row[23]);
        const rawGender = row[13];
        const bodyweight = parseFloat(row[17]);
        const rawTwitterId = row[3];
        const rawInstagramId = row[4];

        console.log(`Lifter: ${lifterName}, Raw Twitter: ${rawTwitterId}, Raw Instagram: ${rawInstagramId}`);

        if (lifterName && !isNaN(glPoints) && glPoints > 50) {
          const existingLifter = allRankingsMap.get(lifterName);
          const gender = rawGender === '女' ? 'F' : 'M';
          const weightClass = getWeightClass(gender, bodyweight);

          if (!existingLifter || glPoints > existingLifter.glPoints) {
            allRankingsMap.set(lifterName, {
              id: String(row[0]),
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
              twitterId: rawTwitterId || null,
              instagramId: rawInstagramId || null,
            });
          }
        }
      });
        console.log(`Fetched ${data.rows.length} lifters. Total unique collected: ${allRankingsMap.size}`);

        if (allRankingsMap.size >= targetRankingsCount) {
          console.log(`Reached target of ${targetRankingsCount} unique rankings. Stopping fetching.`);
          break;
        }
      }

    // After all fetching, sort and slice to get the top N lifters overall
    const newRankingsData = Array.from(allRankingsMap.values())
      .sort((a, b) => b.glPoints - a.glPoints)
      .slice(0, targetRankingsCount);

    // 新しいランキングデータを src/data/rankings.json に書き込む
    fs.writeFileSync(rankingsFilePath, JSON.stringify(newRankingsData, null, 2), 'utf-8');

    // --- 既存のlifters.json生成ロジック ---
    // 2. Read existing lifters data to preserve image paths
    let existingLifters = { male: {}, female: {} }; // Default empty structure
    try {
      existingLifters = JSON.parse(fs.readFileSync(liftersFilePath, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse existing lifters data, starting fresh.', e.message);
    }

    const newLifters = { male: {}, female: {} };

    // Group and sort by gender and weightClass, then select top 3 by total
    const groupedLifters = {};

    newRankingsData.forEach(lifter => { // Use newRankingsData directly
      const genderKey = lifter.gender === 'M' ? 'male' : 'female';
      const weightClassKey = lifter.weightClass;
      
      if (!groupedLifters[genderKey]) {
        groupedLifters[genderKey] = {};
      }
      if (!groupedLifters[genderKey][weightClassKey]) {
        groupedLifters[genderKey][weightClassKey] = [];
      }
      groupedLifters[genderKey][weightClassKey].push(lifter);
    });

    for (const genderKey in groupedLifters) {
      for (const weightClassKey in groupedLifters[genderKey]) {
        const sortedClassLifters = groupedLifters[genderKey][weightClassKey]
          .sort((a, b) => b.total - a.total) // Sort by total (descending)
          .slice(0, 3); // Get top 3

        newLifters[genderKey][weightClassKey] = sortedClassLifters.map(lifter => {
          let imagePath = '';
          // Try to find existing image path
          if (existingLifters[genderKey] && existingLifters[genderKey][weightClassKey]) {
            const existing = existingLifters[genderKey][weightClassKey].find(el => el.name === lifter.lifterName);
            if (existing) {
              imagePath = existing.image;
            }
          }
          return {
            name: lifter.lifterName,
            image: imagePath || '/images/default.jpg',
            squat: lifter.squat || 0,
            bench: lifter.bench || 0,
            deadlift: lifter.deadlift || 0,
            total: lifter.total || 0,
            twitterId: lifter.twitterId || null,
            instagramId: lifter.instagramId || null,
          };
        });
      }
    }

    // Format as JSON content
    const outputContent = JSON.stringify(newLifters, null, 2);

    fs.writeFileSync(liftersFilePath, outputContent, 'utf-8');

  } catch (error) {
    console.error('Error generating lifters data:', error);
  }
};

generateLiftersData();