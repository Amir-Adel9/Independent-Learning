/**
 * Generate OpenAPI schema from the NestJS app and write to packages/api-contract.
 * Strips the /api prefix from path keys so the frontend can use paths without /api
 * and set baseUrl to include /api (e.g. GET('/categories') -> /api/categories).
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../app.module';

const API_PREFIX = 'api';

function stripApiPrefixFromPaths(document: Record<string, unknown>): void {
  const paths = document.paths as Record<string, unknown> | undefined;
  if (!paths) return;
  const next: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(paths)) {
    const newKey = path.startsWith(`/${API_PREFIX}`)
      ? path.slice(API_PREFIX.length + 1) || '/'
      : path;
    next[newKey] = value;
  }
  document.paths = next;
}

async function generate() {
  const app = await NestFactory.create(AppModule);
  try {
    app.setGlobalPrefix(API_PREFIX);

    const config = new DocumentBuilder()
      .setTitle('LMS Auth API')
      .setVersion('1.0')
      .setDescription(
        'This API uses httpOnly cookies for session management: the access_token cookie is sent with general authenticated requests, and the refresh_token cookie is used for token rotation (path-restricted to /api/auth/refresh). Login and register set both cookies; protected routes require the access_token cookie.',
      )
      .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      })
      .addCookieAuth('refresh_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    stripApiPrefixFromPaths(document as unknown as Record<string, unknown>);

    const outputPath = resolve(
      __dirname,
      '../../../../packages/api-contract/swagger.json',
    );
    writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');
    console.log('Wrote', outputPath);
  } finally {
    await app.close();
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
