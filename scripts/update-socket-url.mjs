import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

const envPath = path.resolve('./client/.env');

const startNgrok = () => {
  console.log('🚀 Starting ngrok...');
  exec('ngrok http 3001', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Failed to start ngrok:', err);
    }
    if (stderr) {
      console.error('ngrok stderr:', stderr);
    }
  });
};

const waitForPublicUrl = async () => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const res = await fetch('http://127.0.0.1:4040/api/tunnels');
      const json = await res.json();
      const httpsTunnel = json.tunnels.find(t => t.proto === 'https');

      if (httpsTunnel) {
        return httpsTunnel.public_url;
      }
    } catch (err) {
      // silently retry
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    retries++;
  }

  throw new Error('❌ ngrok public URL not found after waiting.');
};

const updateEnvFile = async (url) => {
  const envContent = `VITE_SOCKET_URL=${url}\n`;
  await fs.writeFile(envPath, envContent, 'utf8');
  console.log(`✅ Updated client/.env with:\n${envContent}`);
};

const run = async () => {
  startNgrok();
  try {
    const publicUrl = await waitForPublicUrl();
    await updateEnvFile(publicUrl);
  } catch (err) {
    console.error(err.message);
  }
};

run();
