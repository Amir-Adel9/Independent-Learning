import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './common/config/env.validation';
import { PrismaModule } from './common/prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';

// Resolve .env from api package root (works from both src/ and dist/ at runtime)
const apiEnvPath = resolve(__dirname, '..', '.env');
// When turbo runs from monorepo root, cwd is root; .env lives in apps/api
const apiEnvFromCwd = resolve(process.cwd(), 'apps', 'api', '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      // Try multiple locations; api .env last so it overrides when multiple exist
      envFilePath: ['.env', apiEnvFromCwd, apiEnvPath],
    }),
    PrismaModule,
    CategoriesModule,
    AuthModule,
    AdminsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
