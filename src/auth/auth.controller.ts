import { Controller, Post, Body, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.login, loginDto.password);
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.login, registerDto.password, registerDto.role);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Проверка авторизации пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь авторизован' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  async checkAuth(@User() user: { userId: number }) {
    return this.authService.checkAuth(user.userId);
  }
} 