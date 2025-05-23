import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(login: string, password: string) {
    const credentials = await this.prisma.credentials.findUnique({
      where: { login },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!credentials) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, credentials.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const { user } = credentials;
    return {
      userId: user.userId,
      login: credentials.login,
      roles: user.roles.map(role => role.role),
    };
  }

  async login(user: any) {
    const payload = {
      sub: user.userId,
      login: user.login,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.userId,
        login: user.login,
        roles: user.roles,
      },
    };
  }

  async register(login: string, password: string, role: Role) {
    const existingCredentials = await this.prisma.credentials.findUnique({
      where: { login },
    });

    if (existingCredentials) {
      throw new UnauthorizedException('Пользователь с таким логином уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          surname: 'Новый',
          name: 'Пользователь',
          patronymic: '',
          roles: {
            create: [{ role }],
          },
          credentials: {
            create: {
              login,
              password: hashedPassword,
            },
          },
        },
        include: {
          roles: true,
        },
      });

      return {
        userId: user.userId,
        login,
        roles: user.roles.map(role => role.role),
      };
    });
  }

  async checkAuth(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        roles: true,
        credentials: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      userId: user.userId,
      login: user.credentials.login,
      roles: user.roles.map(role => role.role),
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic
    };
  }
} 