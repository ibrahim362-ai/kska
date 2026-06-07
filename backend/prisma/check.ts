import prisma from '../src/config/prisma';

async function main() {
  console.log('--- Users ---');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      isVerified: true,
      createdAt: true
    }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('--- Verifications ---');
  const verifications = await prisma.verification.findMany();
  console.log(JSON.stringify(verifications, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
