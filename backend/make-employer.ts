import prisma from './src/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Check if employer account exists
  const existing = await prisma.user.findUnique({
    where: { username: 'employer1' }
  });
  
  if (existing) {
    console.log('✅ Employer account already exists!');
    console.log('Username: employer1');
    console.log('Password: employer123');
    return;
  }
  
  // Create new employer account
  const hashedPassword = await bcrypt.hash('employer123', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'employer@test.com',
      username: 'employer1',
      password: hashedPassword,
      fullName: 'Test Employer',
      role: 'EMPLOYER',
      isVerified: true,
    },
  });
  
  console.log('✅ Employer account created successfully!');
  console.log('\nLogin credentials:');
  console.log('Username: employer1');
  console.log('Password: employer123');
  console.log('\nUse these credentials to login to employer portal');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
