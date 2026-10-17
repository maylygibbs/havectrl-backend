#!/usr/bin/env node
// Crea havectrl_central, demoa y demob en el Postgres de .env.
// Aplica las migraciones y carga los datos de demostración.
// Se puede ejecutar otra vez: no duplica usuarios, vuelos ni gastos.
import { setup } from './seed.mjs';

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});
