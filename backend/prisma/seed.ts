import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
     const email = 'rjthakka@calpoly.edu';

     const user = await prisma.user.upsert({
          where: { email },
          update: { role: Role.BOARD_ADMIN },
          create: {
               email,
               fullName: 'Rishi Thakkar',
               role: Role.BOARD_ADMIN
          },
     });

     console.log({ user });
}

main()
     .catch((e) => {
          console.error(e);
          process.exit(1);
     })
     .finally(async () => {
          await prisma.$disconnect();
     });
