import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Create sample members
  const member1 = await prisma.member.create({
    data: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      city: 'New York',
      region: 'NY',
      country: 'United States',
      membershipType: 'regular',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
    },
  });

  const member2 = await prisma.member.create({
    data: {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0456',
      city: 'Los Angeles',
      region: 'CA',
      country: 'United States',
      membershipType: 'regular',
      status: 'active',
      joinedAt: new Date('2024-02-01'),
    },
  });

  const companion = await prisma.member.create({
    data: {
      email: 'companion.leader@example.com',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      phone: '+1-555-0789',
      city: 'Chicago',
      region: 'IL',
      country: 'United States',
      membershipType: 'consecrated_sister',
      status: 'active',
      joinedAt: new Date('2023-06-01'),
    },
  });

  // Create sample companionship relationships
  const companionship1 = await prisma.companionship.create({
    data: {
      companionId: companion.id,
      accompaniedId: member1.id,
      status: 'active',
      startDate: new Date('2024-03-01'),
      relationshipType: 'companionship',
      notes: 'Initial companionship relationship for new member guidance',
    },
  });

  const companionship2 = await prisma.companionship.create({
    data: {
      companionId: companion.id,
      accompaniedId: member2.id,
      status: 'active',
      startDate: new Date('2024-03-15'),
      relationshipType: 'companionship',
      notes: 'Ongoing support and guidance relationship',
    },
  });

  // Create a sample user for authentication
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Administrator',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:
    - ${member1.firstName} ${member1.lastName} (Member)
    - ${member2.firstName} ${member2.lastName} (Member)  
    - ${companion.firstName} ${companion.lastName} (Companion)
    - 2 companionship relationships
    - 1 admin user for authentication
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
