const { execSync } = require('child_process');

console.log('Testing build process...');

try {
  // Clean install
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build successful!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
