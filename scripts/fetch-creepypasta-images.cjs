const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'characters');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadUrl(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => {
          const stats = fs.statSync(destPath);
          if (stats.size < 1000) {
            fs.unlinkSync(destPath);
            return reject(new Error(`File too small (${stats.size} bytes)`));
          }
          resolve(stats.size);
        });
      });
      fileStream.on('error', (err) => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(new Error('Timeout'));
    });
  });
}

function searchFandom(wiki, searchTerm) {
  return new Promise((resolve) => {
    const searchUrl = `https://${wiki}.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;
    https.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = json.query?.search;
          if (results && results.length > 0) {
            resolve(results[0].title);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function getFandomThumbnail(wiki, pageTitle) {
  return new Promise((resolve) => {
    const url = `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=600`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages || {};
          for (const k in pages) {
            if (pages[k].thumbnail?.source) return resolve(pages[k].thumbnail.source);
          }
          resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function getWikipediaImage(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages || {};
          for (const k in pages) {
            if (pages[k].thumbnail?.source) return resolve(pages[k].thumbnail.source);
          }
          resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

const DIRECT_URLS = {
  'slender-man': 'https://static.wikia.nocookie.net/villains/images/1/1b/Slender-man-chloe-fowler-1.png/revision/latest/scale-to-width-down/600',
  'jeff-the-killer': 'https://static.wikia.nocookie.net/villains/images/9/9c/Jeffart.webp/revision/latest/scale-to-width-down/600',
  'smile-dog': 'https://static.wikia.nocookie.net/creepypasta/images/1/1b/Smile.jpg/revision/latest',
  'laughing-jack': 'https://static.wikia.nocookie.net/villains/images/f/fe/JackTheLaugh.png/revision/latest/scale-to-width-down/500',
  'eyeless-jack': 'https://static.wikia.nocookie.net/villains/images/d/db/Jackhd.jpg/revision/latest/scale-to-width-down/600',
  'the-rake': 'https://static.wikia.nocookie.net/creepypasta/images/0/04/The_Rake.jpg/revision/latest/scale-to-width-down/500',
  'zalgo': 'https://static.wikia.nocookie.net/villains/images/f/fb/Zalgo_by_korazonkrudo-d4ki5il.jpg/revision/latest/scale-to-width-down/500',
  'candle-cove': 'https://static.wikia.nocookie.net/creepypasta/images/b/b3/Candlecovestock.jpg/revision/latest/scale-to-width-down/500',
  'ben-drowned': 'https://static.wikia.nocookie.net/creepypasta/images/0/00/You_shouldn%27t_have_done_that_by_sarawtf.jpg/revision/latest/scale-to-width-down/500',
  'sonic-exe': 'https://static.wikia.nocookie.net/villains/images/6/62/Sonic.exe_.png/revision/latest/scale-to-width-down/500',
  'herobrine': 'https://static.wikia.nocookie.net/villains/images/b/b4/Herobrine.png/revision/latest/scale-to-width-down/400',
  'polybius': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Polybius%2C_coinop.org.jpeg',
  'backrooms': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/HobbyTown_USA_Oshkosh_interior_under_construction_2002_%28The_Backrooms%29.jpg',
  'scp-173': 'https://static.wikia.nocookie.net/villains/images/0/09/TheSCP-173.jpg/revision/latest/scale-to-width-down/450',
  'siren-head': 'https://static.wikia.nocookie.net/villains/images/6/60/Siren_Head.png/revision/latest/scale-to-width-down/400',
  'cartoon-cat': 'https://static.wikia.nocookie.net/villains/images/c/c8/C-Cat.jpg/revision/latest/scale-to-width-down/500',
  'mr-hands': 'https://static.wikia.nocookie.net/villains/images/b/b0/MrWidemouth.jpg/revision/latest/scale-to-width-down/500',
  'bloody-painter': 'https://static.wikia.nocookie.net/villains/images/1/16/Bloody_Painter.jpg/revision/latest/scale-to-width-down/500',
  'clockwork': 'https://static.wikia.nocookie.net/villains/images/8/88/Clockwork_YTIU.webp/revision/latest/scale-to-width-down/500',
  'jane-the-killer': 'https://static.wikia.nocookie.net/villains/images/7/79/JaneHD.png/revision/latest/scale-to-width-down/500',
  'jason-the-toymaker': 'https://static.wikia.nocookie.net/villains/images/3/30/Toymaker.png/revision/latest/scale-to-width-down/500',
  'la-llorona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Estatua_de_la_Llorona.JPG/600px-Estatua_de_la_Llorona.JPG',
  'el-silbon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/El_Silb%C3%B3n.JPG/600px-El_Silb%C3%B3n.JPG'
};

const SEARCH_QUERIES = {
  'ticci-toby': ['Ticci Toby Creepypasta', 'Ticci-Toby'],
  'masky-hoodie': ['Marble Hornets Masky', 'Masky Marble Hornets'],
  'masky': ['Masky Marble Hornets', 'Masky'],
  'hoodie': ['Hoodie Marble Hornets', 'Hoodie'],
  'homicidal-liu': ['Homicidal Liu', 'Liu Woods'],
  'bloody-mary': ['Bloody Mary folklore', 'Bloody Mary urban legend'],
  'sad-satan': ['Sad Satan deep web game', 'Sad Satan'],
  'el-chupacabras': ['Chupacabra', 'El Chupacabras'],
  'la-sayona': ['La Sayona', 'Sayona'],
  'el-cuco': ['El Coco folklore', 'Coco folklore'],
  'la-pincoya': ['Pincoya', 'La Pincoya'],
  'el-trauco': ['Trauco', 'El Trauco'],
  'el-cadejo': ['Cadejo', 'El Cadejo'],
  'la-tunda': ['La Tunda', 'Tunda folklore'],
  'el-pombero': ['Pombero', 'El Pombero'],
  'la-viuda': ['La Viuda Negra leyenda', 'La Viuda folklore'],
  'kate-the-chaser': ['Kate the Chaser Slender', 'Kate the Chaser'],
  'x-virus': ['X-Virus Creepypasta', 'X-Virus'],
  'lulu': ['Lulu Creepypasta', 'Lulu eyes Creepypasta'],
  'nurse-ann': ['The Nurse Ann Creepypasta', 'Nurse Ann'],
  'judge-angel': ['Judge Angels Creepypasta', 'Judge Angel'],
  'the-puppeteer': ['The Puppeteer Creepypasta', 'Puppeteer Creepypasta'],
  'lazari': ['Lazari Creepypasta', 'Lazari Swann'],
  'sally-williams': ['Sally Williams Creepypasta', 'Sally Dawn Creepypasta'],
  'zero': ['Zero Creepypasta Alice', 'Zero Creepypasta'],
  'nemesis': ['Nemesis Creepypasta', 'Nemesis character'],
  'kagekao': ['Kagekao Creepypasta', 'Kagekao'],
  'nina-the-killer': ['Nina the Killer Creepypasta', 'Nina Hopkins'],
  'skully': ['Skully Marble Hornets', 'Marble Hornets Skully'],
  'the-observer': ['The Observer TribeTwelve', 'Observer TribeTwelve'],
  'splendorman': ['Splendorman Creepypasta', 'Splendor Man'],
  'offenderman': ['Offenderman Creepypasta', 'Smexy Creepypasta'],
  'hobo-heart': ['Hobo Heart Creepypasta', 'Hobo Heart'],
  'suicide-sadie': ['Suicide Sadie Creepypasta', 'Sadie Bennett Creepypasta'],
  'laughing-jill': ['Laughing Jill Creepypasta', 'Laughing Jill'],
  'candy-pop': ['Candy Pop Creepypasta', 'Candy Pop Jester'],
  'candy-cane': ['Candy Cane Creepypasta', 'Candy Cane Pop'],
  'lifeless-lucy': ['Lifeless Lucy Creepypasta', 'Lifeless Lucy'],
  'nightmare-ally': ['Nightmare Ally Creepypasta', 'Nightmare Ally']
};

async function findImageUrl(id) {
  if (DIRECT_URLS[id]) return DIRECT_URLS[id];
  const queries = SEARCH_QUERIES[id] || [id.replace(/-/g, ' ')];
  for (const q of queries) {
    // 1. Check villains fandom
    const titleV = await searchFandom('villains', q);
    if (titleV) {
      const urlV = await getFandomThumbnail('villains', titleV);
      if (urlV) return urlV;
    }
    // 2. Check creepypasta fandom
    const titleC = await searchFandom('creepypasta', q);
    if (titleC) {
      const urlC = await getFandomThumbnail('creepypasta', titleC);
      if (urlC) return urlC;
    }
    // 3. Check wikipedia
    const urlW = await getWikipediaImage(q);
    if (urlW) return urlW;
  }
  return null;
}

async function main() {
  const allIds = [
    ...Object.keys(DIRECT_URLS),
    ...Object.keys(SEARCH_QUERIES)
  ];
  const uniqueIds = Array.from(new Set(allIds));
  console.log(`Starting download for ${uniqueIds.length} characters...`);

  let successCount = 0;
  let failCount = 0;

  for (const id of uniqueIds) {
    const existing = fs.readdirSync(OUTPUT_DIR).find(f => f.startsWith(`${id}.`));
    if (existing) {
      console.log(`[EXISTS] ${id} -> ${existing}`);
      successCount++;
      continue;
    }

    try {
      const url = await findImageUrl(id);
      if (!url) {
        console.log(`[MISSING_URL] ${id}`);
        failCount++;
        continue;
      }
      let ext = '.jpg';
      if (url.includes('.png')) ext = '.png';
      else if (url.includes('.webp')) ext = '.webp';
      else if (url.includes('.jpeg')) ext = '.jpeg';

      const targetPath = path.join(OUTPUT_DIR, `${id}${ext}`);
      console.log(`[DOWNLOADING] ${id} from ${url.slice(0, 80)}...`);
      await downloadUrl(url, targetPath);
      console.log(`[SUCCESS] Saved ${id}${ext}`);
      successCount++;
    } catch(err) {
      console.log(`[ERROR] ${id}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`Finished: ${successCount} downloaded/existing, ${failCount} failed.`);
}

main();
