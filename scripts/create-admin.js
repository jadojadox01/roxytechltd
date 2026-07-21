const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const password = 'admin';
  const name = 'Admin';

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists. Updating role to ADMIN and password.');
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN', password: hashed, name } });
    console.log('Updated existing admin:', email);
  } else {
    const user = await prisma.user.create({ data: { email, password: hashed, role: 'ADMIN', name } });
    console.log('Created admin:', user.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
