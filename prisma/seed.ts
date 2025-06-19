import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очищаем базу данных
  await prisma.session.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.teacherGroupSubject.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.credentials.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.student.deleteMany();
  await prisma.group.deleteMany();
  await prisma.subject.deleteMany();
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
          password: await bcrypt.hash('Admin@2024', 10),
        },
      },
    },
  });

  // Создаем преподавателя
  const teacher = await prisma.user.create({
    data: {
      surname: 'Иванов',
      name: 'Иван',
      patronymic: 'Иванович',
      roles: {
        create: [{ role: Role.teacher }],
      },
      credentials: {
        create: {
          login: 'teacher',
          password: await bcrypt.hash('Teacher@2024', 10),
        },
      },
    },
  });

  console.log('✅ База данных успешно заполнена начальными пользователями');
  console.log('👤 Администратор:');
  console.log('   Логин: admin');
  console.log('   Пароль: Admin@2024');
  console.log('👤 Преподаватель:');
  console.log('   Логин: teacher');
  console.log('   Пароль: Teacher@2024');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
