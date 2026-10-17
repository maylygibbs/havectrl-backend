import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { HealthController } from './health.controller';
import { ConfigRegistry } from './tenancy/config-registry';
import { TenantMiddleware } from './tenancy/tenant.middleware';
import { WorkspaceController } from './workspace/workspace.controller';
import { WorkspaceService } from './workspace/workspace.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'havectrl-dev-secret',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [HealthController, AuthController, WorkspaceController],
  providers: [ConfigRegistry, AuthService, AuthGuard, WorkspaceService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
