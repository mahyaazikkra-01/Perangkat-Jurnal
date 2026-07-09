const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    // Initial fetch of config
    const unsubSchoolConfig = syncConfig('schoolConfig', setSchoolConfig, DEFAULT_SCHOOL_CONFIG);`;

const replacement = `  useEffect(() => {
    // Initial fetch of config
    const unsubSchoolConfig = syncConfig('schoolConfig', setSchoolConfig, DEFAULT_SCHOOL_CONFIG);`;

// Wait, I can just patch schoolConfig inside the render.
