const bcrypt = require('bcryptjs');

// Generate a hashed password for admin
const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('\n=== Admin Password Hash Generated ===');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nAdd this to your backend/.env file:');
  console.log(`ADMIN_PASSWORD=${hash}`);
  console.log('\n');
});
