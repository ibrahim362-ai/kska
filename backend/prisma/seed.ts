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
    where: { email: 'admin@kska.com' },
    update: {
      password: adminPassword,
      username: 'kskaadmin',
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: 'admin@kska.com',
      username: 'kskaadmin',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: 'employer@kska.com' },
    update: {
      password: employerPassword,
      username: 'kskaemployer',
      role: 'EMPLOYER',
      isVerified: true,
    },
    create: {
      email: 'employer@kska.com',
      username: 'kskaemployer',
      password: employerPassword,
      fullName: 'Employer User',
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user@kska.com' },
    update: {
      password: userPassword,
      username: 'kskauser',
      role: 'USER',
      isVerified: true,
    },
    create: {
      email: 'user@kska.com',
      username: 'kskauser',
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
      update: {
        level: 0,
        planType: 'FREE',
        price: 0,
        pointsReward: 0,
        duration: 99999,
        extraVotes: 0,
        priorityTicket: false,
        leaderboardBoost: 1.0,
        vipSeat: false,
        challengeAccess: false, // ❌ Can only VIEW challenges, cannot accept
        communityAccess: false, // ❌ No community access
      },
      create: {
        name: 'FREE',
        planType: 'FREE',
        level: 0,
        price: 0,
        pointsReward: 0,
        duration: 99999,
        badgeIcon: 'free-badge',
        extraVotes: 0,
        priorityTicket: false,
        leaderboardBoost: 1.0,
        vipSeat: false,
        challengeAccess: false,
        communityAccess: false,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'SILVER' },
      update: {
        level: 1,
        planType: 'SILVER',
        price: 99,
        pointsReward: 10,
        duration: 30,
        extraVotes: 1,
        priorityTicket: false, // ❌
        leaderboardBoost: 1.0,
        vipSeat: false,
        challengeAccess: true, // ✅ 1. Access to challenges
        communityAccess: true, // ✅ 2. Access to special community groups
      },
      create: {
        name: 'SILVER',
        planType: 'SILVER',
        level: 1,
        price: 99,
        pointsReward: 10,
        duration: 30,
        badgeIcon: 'silver-badge',
        extraVotes: 1,
        priorityTicket: false,
        leaderboardBoost: 1.0,
        vipSeat: false,
        challengeAccess: true,
        communityAccess: true,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'GOLD' },
      update: {
        level: 2,
        planType: 'GOLD',
        price: 199,
        pointsReward: 20,
        duration: 30,
        extraVotes: 3,
        priorityTicket: true, // ✅ 1. Priority ticket booking
        leaderboardBoost: 1.0,
        vipSeat: false,
        challengeAccess: true, // ✅ 2. Access to challenges
        communityAccess: true, // ✅ 3. Access to special community groups
      },
      create: {
        name: 'GOLD',
        planType: 'GOLD',
        level: 2,
        price: 199,
        pointsReward: 20,
        duration: 30,
        badgeIcon: 'gold-badge',
        extraVotes: 3,
        priorityTicket: true,
        leaderboardBoost: 1.0,
        vipSeat: false,
        challengeAccess: true,
        communityAccess: true,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'VIP' },
      update: {
        level: 3,
        planType: 'VIP',
        price: 499,
        pointsReward: 30,
        duration: 30,
        extraVotes: 5,
        priorityTicket: true, // ✅ 1. Priority ticket booking
        leaderboardBoost: 1.5, // ✅ 2. 1.5x leaderboard boost
        vipSeat: false,
        challengeAccess: true, // ✅ 3. Access to challenges
        communityAccess: true, // ✅ 4. Access to special community groups
      },
      create: {
        name: 'VIP',
        planType: 'VIP',
        level: 3,
        price: 499,
        pointsReward: 30,
        duration: 30,
        badgeIcon: 'vip-badge',
        extraVotes: 5,
        priorityTicket: true,
        leaderboardBoost: 1.5,
        vipSeat: false,
        challengeAccess: true,
        communityAccess: true,
      },
    }),
    prisma.membership.upsert({
      where: { name: 'VVIP' },
      update: {
        level: 4,
        planType: 'VVIP',
        price: 999,
        pointsReward: 50,
        duration: 30,
        extraVotes: 10,
        priorityTicket: true, // ✅ 1. Priority ticket booking
        leaderboardBoost: 2.0, // ✅ 2. 2x leaderboard boost
        vipSeat: true, // ✅ 3. VIP Seat
        challengeAccess: true, // ✅ 4. Access to challenges
        communityAccess: true, // ✅ 5. Access to special community groups
      },
      create: {
        name: 'VVIP',
        planType: 'VVIP',
        level: 4,
        price: 999,
        pointsReward: 50,
        duration: 30,
        badgeIcon: 'vvip-badge',
        extraVotes: 10,
        priorityTicket: true,
        leaderboardBoost: 2.0,
        vipSeat: true,
        challengeAccess: true,
        communityAccess: true,
      },
    }),
  ]);

  console.log('✅ Memberships seeded');

  const samplePost = await prisma.post.create({
    data: {
      userId: superAdmin.id,
      type: 'ANNOUNCEMENT',
      content: 'Welcome to KSKA! This is your hub for events, voting, and community engagement.',
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
      title: 'KSKA Meetup 2026',
      description: 'Join us for the annual KSKA meetup. Networking, talks, and fun!',
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
    create: { key: 'app_name', value: 'KSKA' },
  });

  console.log('✅ Settings seeded');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Test accounts:');
  console.log('  ibrahimkamil362@gmail.com / admin123');
  console.log('  admin@kska.com / admin123');
  console.log('  employer@kska.com / employer123');
  console.log('  user@kska.com / user123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
