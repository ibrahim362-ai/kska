import prisma from '../src/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const employerPassword = await bcrypt.hash('employer123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'ibrahimkamil362@gmail.com' },
    update: {
      password: adminPassword,
      username: 'ibrahimkamil362',
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
    create: {
      email: 'ibrahimkamil362@gmail.com',
      username: 'ibrahimkamil362',
      password: adminPassword,
      fullName: 'Ibrahim Kamil',
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@community.com' },
    update: {},
    create: {
      email: 'admin@community.com',
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: 'employer@community.com' },
    update: {
      password: employerPassword,
      username: 'employer',
      role: 'EMPLOYER',
      isVerified: true,
    },
    create: {
      email: 'employer@community.com',
      username: 'employer',
      password: employerPassword,
      fullName: 'Employer User',
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user@community.com' },
    update: {
      password: userPassword,
      username: 'user',
      role: 'USER',
      isVerified: true,
    },
    create: {
      email: 'user@community.com',
      username: 'user',
      password: userPassword,
      fullName: 'Regular User',
      role: 'USER',
      isVerified: true,
    },
  });

  console.log('✅ Users seeded');

  const memberships = await Promise.all([
    prisma.membership.upsert({
      where: { name: 'FREE' },
      update: {},
      create: {
        name: 'FREE',
        planType: 'FREE',
        price: 0,
        duration: 99999,
        badgeIcon: 'free-badge',
        extraVotes: 0,
        priorityTicket: false,
        leaderboardBoost: 1.0,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'SILVER' },
      update: {},
      create: {
        name: 'SILVER',
        planType: 'SILVER',
        price: 99,
        duration: 30,
        badgeIcon: 'silver-badge',
        extraVotes: 1,
        priorityTicket: false,
        leaderboardBoost: 1.5,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'GOLD' },
      update: {},
      create: {
        name: 'GOLD',
        planType: 'GOLD',
        price: 199,
        duration: 30,
        badgeIcon: 'gold-badge',
        extraVotes: 3,
        priorityTicket: true,
        leaderboardBoost: 2.0,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'VIP' },
      update: {},
      create: {
        name: 'VIP',
        planType: 'VIP',
        price: 499,
        duration: 30,
        badgeIcon: 'vip-badge',
        extraVotes: 5,
        priorityTicket: true,
        leaderboardBoost: 3.0,
      },
    }),
  ]);

  console.log('✅ Memberships seeded');

  const samplePost = await prisma.post.create({
    data: {
      userId: superAdmin.id,
      type: 'ANNOUNCEMENT',
      content: 'Welcome to the Community Platform! This is your hub for events, voting, and community engagement.',
      hashtags: 'welcome community announcement',
      isPinned: true,
    },
  });

  console.log('✅ Sample post created');

  const sampleVote = await prisma.vote.create({
    data: {
      creatorId: employer.id,
      title: 'Best Feature of the Platform?',
      description: 'Vote for your favorite feature!',
      voteType: 'FREE_VOTE',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isLive: true,
      options: {
        create: [
          { text: 'Voting System', sortOrder: 0 },
          { text: 'Ticket Management', sortOrder: 1 },
          { text: 'Membership Plans', sortOrder: 2 },
          { text: 'Leaderboard System', sortOrder: 3 },
        ],
      },
    },
  });

  console.log('✅ Sample vote created');

  const sampleTicket = await prisma.ticket.create({
    data: {
      creatorId: employer.id,
      title: 'Community Meetup 2026',
      description: 'Join us for the annual community meetup. Networking, talks, and fun!',
      price: 0,
      quantity: 500,
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'Addis Ababa, Bole',
    },
  });

  console.log('✅ Sample ticket created');

  const sampleSetting = await prisma.setting.upsert({
    where: { key: 'app_name' },
    update: {},
    create: { key: 'app_name', value: 'Community Hub' },
  });

  console.log('✅ Settings seeded');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Test accounts:');
  console.log('  ibrahimkamil362@gmail.com / admin123');
  console.log('  admin@community.com / admin123');
  console.log('  employer@community.com / employer123');
  console.log('  user@community.com / user123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
