export function centralEnv() {
  return {
    host: process.env.CENTRAL_DB_HOST ?? 'localhost',
    port: Number(process.env.CENTRAL_DB_PORT ?? 5432),
    user: process.env.CENTRAL_DB_USER ?? 'postgres',
    password: process.env.CENTRAL_DB_PASSWORD ?? '123456',
    database: process.env.CENTRAL_DB_NAME ?? 'havectrl_central',
  };
}
