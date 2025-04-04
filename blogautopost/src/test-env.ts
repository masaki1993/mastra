import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

console.log('Current working directory:', process.cwd());

// Try different .env file locations
const possibleEnvPaths = [
  '.env',
  '../.env',
  '../../.env',
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'src', 'mastra', '.env'),
];

for (const envPath of possibleEnvPaths) {
  try {
    if (fs.existsSync(envPath)) {
      console.log(`Found .env file at: ${envPath}`);
      dotenv.config({ path: envPath });
    } else {
      console.log(`No .env file found at: ${envPath}`);
    }
  } catch (err) {
    console.error(`Error checking ${envPath}:`, err);
  }
}

// Print all environment variables that start with SERP
console.log('\nEnvironment variables:');
Object.keys(process.env).forEach(key => {
  if (key.startsWith('SERP')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

console.log('\nSERPAPI_API_KEY:', process.env.SERPAPI_API_KEY);
