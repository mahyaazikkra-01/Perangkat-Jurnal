const https = require('https');

https.get('https://html.duckduckgo.com/html/?q=logo+smpn+1+beji+pasuruan', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // try to find img src
    const matches = data.match(/<img[^>]+src="([^">]+)"/g);
    console.log("Images found:", matches ? matches.slice(0, 5) : "none");
  });
});
