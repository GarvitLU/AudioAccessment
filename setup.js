#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎤 AI Audio Assessment System Setup\n');
console.log('This script will help you configure your environment variables.\n');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    try {
        // Check if .env already exists
        if (fs.existsSync('.env')) {
            const overwrite = await question('A .env file already exists. Do you want to overwrite it? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('Setup cancelled. Your existing .env file has been preserved.');
                rl.close();
                return;
            }
        }

        console.log('\n📝 Configuration Options:\n');

        // OpenAI API Key
        const apiKey = await question('Enter your OpenAI API key: ');
        if (!apiKey.trim()) {
            console.log('❌ OpenAI API key is required!');
            rl.close();
            return;
        }

        // Port
        const port = await question('Enter server port (default: 3000): ') || '3000';

        // Environment
        const env = await question('Enter environment (development/production, default: development): ') || 'development';

        // Max file size
        const maxFileSize = await question('Enter max audio file size in MB (default: 10): ') || '10';

        // Create .env content
        const envContent = `# OpenAI API Configuration
OPENAI_API_KEY=${apiKey}

# Server Configuration
PORT=${port}
NODE_ENV=${env}

# File Upload Configuration
MAX_FILE_SIZE=${parseInt(maxFileSize) * 1024 * 1024}
UPLOAD_PATH=./uploads
`;

        // Write .env file
        fs.writeFileSync('.env', envContent);

        console.log('\n✅ Configuration completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm start');
        console.log('2. Open: http://localhost:' + port);
        console.log('3. Start recording and evaluating audio responses!');
        
        console.log('\n🔧 Configuration saved to .env file:');
        console.log('- OpenAI API Key: ' + (apiKey.length > 10 ? apiKey.substring(0, 10) + '...' : apiKey));
        console.log('- Server Port: ' + port);
        console.log('- Environment: ' + env);
        console.log('- Max File Size: ' + maxFileSize + 'MB');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

setup(); 