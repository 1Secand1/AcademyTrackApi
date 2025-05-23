import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очищаем базу данных
  await prisma.session.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.credentials.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Создаем пользователей...');

  // Создаем администратора
  const adminUser = await prisma.user.create({
    data: {
      surname: 'Администратор',
      name: 'Системы',
      patronymic: 'Академической',
      roles: {
        create: [{ role: Role.admin }],
      },
      credentials: {
        create: {
          login: 'admin',
          password: await bcrypt.hash('admin123', 10),
        },
      },
    },
  });

  // Создаем преподавателей
  const teacher1 = await prisma.user.create({
    data: {
      surname: 'Иванов',
      name: 'Иван',
      patronymic: 'Иванович',
      roles: {
        create: [{ role: Role.teacher }],
      },
      credentials: {
        create: {
          login: 'teacher1',
          password: await bcrypt.hash('teacher1', 10),
        },
      },
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      surname: 'Петров',
      name: 'Петр',
      patronymic: 'Петрович',
      roles: {
        create: [{ role: Role.teacher }],
      },
      credentials: {
        create: {
          login: 'teacher2',
          password: await bcrypt.hash('teacher2', 10),
        },
      },
    },
  });

  console.log('✅ База данных успешно заполнена тестовыми данными');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
