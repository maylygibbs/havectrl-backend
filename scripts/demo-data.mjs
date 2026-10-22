const PROFILES = [
  ['admin', 'Administrador'],
  ['piloto', 'Piloto'],
  ['jefe_sms', 'Jefe de SMS'],
  ['tecnico', 'Técnico'],
  ['despachador', 'Despachador'],
];

const COMPANIES = {
  demoa: {
    users: [
      ['admin@demoa.local', 'Admin Demo A', 'admin'],
      ['piloto@demoa.local', 'Ana Rivas', 'piloto'],
      ['sms@demoa.local', 'Carmen Silva', 'jefe_sms'],
      ['tecnico@demoa.local', 'Pedro Díaz', 'tecnico'],
      ['despacho@demoa.local', 'Elena Cruz', 'despachador'],
    ],
    workers: [
      ['DA-01', 'Ana Rivas', 'Piloto', 'SVMI', 'YV-PL-1044', '2027-04-12', '2027-01-20'],
      ['DA-02', 'Luis Ortega', 'Copiloto', 'SVMI', 'YV-PL-2281', '2026-12-02', '2026-11-15'],
      ['DA-03', 'Marta León', 'Tripulante de cabina', 'SVMI', null, null, '2027-03-01'],
      ['DA-04', 'Pedro Díaz', 'Técnico', 'SVMI', 'YV-TM-441', '2027-06-30', null],
      ['DA-05', 'Elena Cruz', 'Despachador', 'SVMI', 'YV-DSP-19', '2027-02-28', null],
      ['DA-06', 'Carmen Silva', 'Jefe de SMS', 'SVMI', null, null, null],
    ],
    duties: [
      ['DA-01', 'Flight Duty', '2026-10-08T14:00:00Z', '2026-10-08T15:10:00Z', 'HV1234 SVMI SVVA'],
      ['DA-02', 'Flight Duty', '2026-10-08T14:00:00Z', '2026-10-08T15:10:00Z', 'HV1234 SVMI SVVA'],
      ['DA-03', 'Training', '2026-10-09T08:00:00Z', '2026-10-09T16:00:00Z', 'TRG Recurrent'],
      ['DA-01', 'Rest', '2026-10-10T00:00:00Z', '2026-10-10T23:59:00Z', 'OFF'],
      ['DA-04', 'Work', '2026-10-11T12:00:00Z', '2026-10-11T20:00:00Z', 'TRG Line maintenance'],
      ['DA-05', 'Flight Duty', '2026-10-12T10:00:00Z', '2026-10-12T18:00:00Z', 'HV1040 SVVA SVMC'],
      ['DA-01', 'Flight Duty', '2026-10-18T11:00:00Z', '2026-10-18T16:00:00Z', 'HV101 SVMI SVVA'],
      ['DA-02', 'Flight Duty', '2026-10-18T11:00:00Z', '2026-10-18T16:00:00Z', 'HV101 SVMI SVVA'],
      ['DA-04', 'Work', '2026-10-18T12:00:00Z', '2026-10-18T20:00:00Z', 'Inspección de línea'],
      ['DA-05', 'Flight Duty', '2026-10-18T10:00:00Z', '2026-10-18T18:00:00Z', 'HV102 SVMI SVLC'],
    ],
    experience: [
      ['DA-01', 'PIC King Air 350', 1840.5],
      ['DA-02', 'SIC King Air 350', 620.25],
      ['DA-04', 'Trabajo técnico', 910],
    ],
    aircraft: [
      ['YV3301', 'King Air 350', 'FL-350-441', 'SVMI', 'in_service', 6420.4, 4102],
      ['YV3308', 'King Air 350', 'FL-350-508', 'SVMI', 'in_maintenance', 7104.1, 4660],
    ],
    documents: [
      ['YV3301', 'Certificado de aeronavegabilidad', 'valid', '2027-05-01'],
      ['YV3301', 'Seguro de casco', 'valid', '2026-12-31'],
      ['YV3308', 'Certificado de aeronavegabilidad', 'expiring', '2026-11-02'],
    ],
    flights: [
      ['HV101', 'YV3301', '2026-10-18', 'SVMI', 'SVMC', 'arrived', '12:30'],
      ['HV102', 'YV3301', '2026-10-18', 'SVMC', 'SVMI', 'planned', '15:10'],
    ],
    plans: [
      ['HV101', 'HV101', 'SVMI DCT SVMC', 'submitted'],
      ['HV102', 'HV102', 'SVMC DCT SVMI', 'draft'],
    ],
    logs: [
      ['HV101', 78, 64, 1, 'Ana Rivas', 'reviewed', 'Tramo sin novedad.'],
      ['HV102', 0, 0, 0, 'Ana Rivas', 'pending', 'Pendiente de operación.'],
    ],
    services: [
      ['HV101', 'fuel', 'Aerosuministros Maiquetía', 'received', 1860, 'USD'],
      ['HV101', 'handling', 'Servicios SVMI', 'confirmed', 420, 'USD'],
      ['HV102', 'hotac', 'Hotel Maracaibo', 'requested', 180, 'USD'],
    ],
    expenses: [
      ['HV101', 'HOTAC', 'Habitación de pernocta de la tripulación', 180, 'USD', 'submitted', 'piloto@demoa.local'],
      ['HV101', 'Catering', 'Servicio a bordo ida', 96, 'USD', 'approved', 'despacho@demoa.local'],
    ],
    inspections: [
      ['YV3301', 'Inspección 200 h', '2026-11-15', 6600, 'scheduled'],
      ['YV3308', 'Inspección de fase', '2026-10-22', 7120, 'due'],
    ],
    discrepancies: [
      ['YV3308', 'HV101', 'Indicación intermitente de tren', 'La luz de tren aparece de forma intermitente en tierra.', 'open', 'Ana Rivas'],
    ],
    orders: [
      ['YV3308', 'Indicación intermitente de tren', 'Revisar microswitch de tren', 'open', 'Pedro Díaz'],
    ],
    reports: [
      ['Objeto suelto en rampa', 'Se observó un objeto suelto cerca del puesto de la YV3301 antes de la salida.', true, null, 'medium'],
      ['Ave en aproximación a SVMC', 'Impacto menor en aproximación. Sin daño visible después del aterrizaje.', false, 'piloto@demoa.local', 'low'],
    ],
    meetings: [
      ['Revisión semanal de operación', '2026-10-21T14:00:00Z', 'Cobertura de tripulación, YV3308 y gastos de la semana.', 'Acta en borrador. Pendiente de firmas.', 'draft'],
    ],
    library: [
      ['MEL-KA350', 'MEL King Air 350', 'Manual de aeronave', 'Rev 12', 'en', 'current'],
      ['SOP-DA', 'SOP de operación Demo A', 'Manual del operador', '2026-09', 'es', 'current'],
    ],
  },
  demob: {
    users: [
      ['admin@demob.local', 'Admin Demo B', 'admin'],
      ['piloto@demob.local', 'Jorge Méndez', 'piloto'],
      ['sms@demob.local', 'Héctor Navarro', 'jefe_sms'],
      ['tecnico@demob.local', 'Andrés Molina', 'tecnico'],
      ['despacho@demob.local', 'Rosa Ibáñez', 'despachador'],
    ],
    workers: [
      ['DB-01', 'Jorge Méndez', 'Piloto', 'SVVA', 'YV-PL-7781', '2027-08-19', '2027-02-11'],
      ['DB-02', 'Lucía Paredes', 'Copiloto', 'SVVA', 'YV-PL-1902', '2026-11-30', '2027-01-08'],
      ['DB-03', 'Andrés Molina', 'Técnico', 'SVVA', 'YV-TM-902', '2027-09-01', null],
      ['DB-04', 'Rosa Ibáñez', 'Despachador', 'SVVA', 'YV-DSP-44', '2027-04-04', null],
      ['DB-05', 'Héctor Navarro', 'Jefe de SMS', 'SVVA', null, null, null],
    ],
    duties: [
      ['DB-01', 'Flight Duty', '2026-10-19T13:00:00Z', '2026-10-19T18:30:00Z', 'HB201'],
      ['DB-02', 'Flight Duty', '2026-10-19T13:00:00Z', '2026-10-19T18:30:00Z', 'HB201'],
      ['DB-03', 'Standby', '2026-10-19T12:00:00Z', '2026-10-19T20:00:00Z', 'Guardia de base'],
      ['DB-04', 'Flight Duty', '2026-10-19T12:00:00Z', '2026-10-19T19:00:00Z', 'Despacho Valencia'],
    ],
    experience: [
      ['DB-01', 'PIC Learjet 45', 2466.75],
      ['DB-02', 'SIC Learjet 45', 804.5],
      ['DB-03', 'Trabajo técnico', 1320],
    ],
    aircraft: [
      ['YV4502', 'Learjet 45', '45-2188', 'SVVA', 'in_service', 5122.8, 2988],
      ['YV4510', 'Learjet 45', '45-2401', 'SVVA', 'unavailable', 8330.2, 4511],
    ],
    documents: [
      ['YV4502', 'Certificado de aeronavegabilidad', 'valid', '2027-07-14'],
      ['YV4502', 'Póliza de responsabilidad', 'valid', '2027-01-31'],
      ['YV4510', 'Directiva pendiente de cierre', 'expired', '2026-09-30'],
    ],
    flights: [
      ['HB201', 'YV4502', '2026-10-19', 'SVVA', 'SVMG', 'assigned', '14:00'],
      ['HB210', 'YV4502', '2026-10-17', 'SVMG', 'SVVA', 'arrived', '18:40'],
    ],
    plans: [
      ['HB201', 'HB201', 'SVVA DCT SVMG', 'validated'],
      ['HB210', 'HB210', 'SVMG DCT SVVA', 'submitted'],
    ],
    logs: [
      ['HB201', 0, 0, 0, 'Jorge Méndez', 'pending', 'Aún no operado.'],
      ['HB210', 96, 81, 1, 'Jorge Méndez', 'pending', 'El piloto reportó olor a combustible en rodaje.'],
    ],
    services: [
      ['HB201', 'fuel', 'Combustibles Valencia', 'requested', 2400, 'USD'],
      ['HB210', 'handling', 'Margarita Handling', 'received', 510, 'USD'],
      ['HB201', 'catering', 'Cocina SVVA', 'confirmed', 140, 'USD'],
    ],
    expenses: [
      ['HB210', 'Transporte', 'Traslado de tripulación en Margarita', 45, 'USD', 'submitted', 'piloto@demob.local'],
      ['HB201', 'Tasas', 'Tasa aeroportuaria estimada', 220, 'USD', 'draft', 'despacho@demob.local'],
    ],
    inspections: [
      ['YV4502', 'Inspección 100 h', '2026-10-28', 5200, 'due'],
      ['YV4510', 'Overhaul de motor izquierdo', '2026-12-01', 8400, 'scheduled'],
    ],
    discrepancies: [
      ['YV4502', 'HB210', 'Olor a combustible en rodaje', 'Olor persistente en cabina durante el rodaje de salida en SVMG.', 'open', 'Jorge Méndez'],
    ],
    orders: [
      ['YV4502', 'Olor a combustible en rodaje', 'Inspeccionar drenajes y sellos de ala', 'open', 'Andrés Molina'],
    ],
    reports: [
      ['Olor a combustible', 'Durante el rodaje de HB210 la tripulación percibió olor a combustible. Se suspendió la siguiente salida.', false, 'piloto@demob.local', 'high'],
    ],
    meetings: [
      ['Acta de seguridad de octubre', '2026-10-20T15:00:00Z', 'Reporte de olor a combustible y estado de la YV4510.', 'Se asigna seguimiento a mantenimiento. Sin divulgación del relato original fuera de SMS.', 'signed'],
    ],
    library: [
      ['MEL-LJ45', 'MEL Learjet 45', 'Manual de aeronave', 'Rev 8', 'en', 'current'],
      ['QRH-LJ45', 'QRH Learjet 45', 'Manual de aeronave', 'Rev 8', 'en', 'current'],
      ['SOP-DB', 'SOP de operación Demo B', 'Manual del operador', '2026-08', 'es', 'current'],
    ],
  },
};

async function profileId(client, code) {
  const { rows } = await client.query(`SELECT id FROM identity.profiles WHERE code = $1`, [code]);
  return rows[0].id;
}

async function aircraftId(client, registration) {
  const { rows } = await client.query(`SELECT id FROM aircraft.aircraft WHERE registration = $1`, [registration]);
  return rows[0].id;
}

async function flightId(client, code) {
  const { rows } = await client.query(`SELECT id FROM flights.flights WHERE code = $1`, [code]);
  return rows[0].id;
}

async function workerId(client, code) {
  const { rows } = await client.query(`SELECT id FROM crew.workers WHERE employee_code = $1`, [code]);
  return rows[0].id;
}

export async function seedDemo(client, slug, passwordHash) {
  const company = COMPANIES[slug];
  if (!company) return;

  for (const [code, name] of PROFILES) {
    await client.query(
      `INSERT INTO identity.profiles (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING`,
      [code, name],
    );
  }

  for (const [email, name, profile] of company.users) {
    const profileRef = await profileId(client, profile);
    await client.query(
      `INSERT INTO identity.users (email, password_hash, name, profile_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET profile_id = EXCLUDED.profile_id, name = EXCLUDED.name`,
      [email, passwordHash, name, profileRef],
    );
  }

  for (const [code, name, position, base, license, licenseExpires, medicalExpires] of company.workers) {
    await client.query(
      `INSERT INTO crew.workers (employee_code, full_name, position, base, license_number, license_expires, medical_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (employee_code) DO NOTHING`,
      [code, name, position, base, license, licenseExpires, medicalExpires],
    );
  }

  for (const [code, activity, starts, ends, notes] of company.duties) {
    const worker = await workerId(client, code);
    await client.query(
      `INSERT INTO crew.assignments (worker_id, activity, starts_at, ends_at, notes)
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (
         SELECT 1 FROM crew.assignments WHERE worker_id = $1 AND activity = $2 AND starts_at = $3
       )`,
      [worker, activity, starts, ends, notes],
    );
  }

  for (const [code, category, hours] of company.experience) {
    const worker = await workerId(client, code);
    await client.query(
      `INSERT INTO crew.experience (worker_id, category, hours, as_of)
       SELECT $1, $2, $3, '2026-10-17'
       WHERE NOT EXISTS (SELECT 1 FROM crew.experience WHERE worker_id = $1 AND category = $2)`,
      [worker, category, hours],
    );
  }

  for (const [registration, model, serial, base, status, hours, cycles] of company.aircraft) {
    await client.query(
      `INSERT INTO aircraft.aircraft (registration, model, serial_number, base, technical_status, airframe_hours, airframe_cycles)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (registration) DO NOTHING`,
      [registration, model, serial, base, status, hours, cycles],
    );
  }

  for (const [registration, title, status, expires] of company.documents) {
    const aircraft = await aircraftId(client, registration);
    await client.query(
      `INSERT INTO aircraft.documents (aircraft_id, title, status, expires_on)
       SELECT $1, $2, $3, $4
       WHERE NOT EXISTS (SELECT 1 FROM aircraft.documents WHERE aircraft_id = $1 AND title = $2)`,
      [aircraft, title, status, expires],
    );
  }

  for (const [code, registration, date, origin, destination, status, eobt] of company.flights) {
    const aircraft = await aircraftId(client, registration);
    await client.query(
      `INSERT INTO flights.flights (code, aircraft_id, flight_date, origin, destination, status, eobt)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code) DO NOTHING`,
      [code, aircraft, date, origin, destination, status, eobt],
    );
  }

  for (const [code, identification, route, status] of company.plans) {
    const flight = await flightId(client, code);
    await client.query(
      `INSERT INTO flights.flight_plans (flight_id, identification, route, fpl_status)
       SELECT $1, $2, $3, $4
       WHERE NOT EXISTS (SELECT 1 FROM flights.flight_plans WHERE flight_id = $1)`,
      [flight, identification, route, status],
    );
  }

  for (const [code, block, flightMinutes, cycles, pilot, review, notes] of company.logs) {
    const flight = await flightId(client, code);
    await client.query(
      `INSERT INTO flights.logs (flight_id, block_minutes, flight_minutes, cycles, pilot_name, review_status, notes)
       SELECT $1, $2, $3, $4, $5, $6, $7
       WHERE NOT EXISTS (SELECT 1 FROM flights.logs WHERE flight_id = $1)`,
      [flight, block, flightMinutes, cycles, pilot, review, notes],
    );
  }

  for (const [code, kind, provider, status, amount, currency] of company.services) {
    const flight = await flightId(client, code);
    await client.query(
      `INSERT INTO ops.services (flight_id, kind, provider, status, amount, currency)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (SELECT 1 FROM ops.services WHERE flight_id = $1 AND kind = $2)`,
      [flight, kind, provider, status, amount, currency],
    );
  }

  for (const [code, category, description, amount, currency, status, author] of company.expenses) {
    const flight = await flightId(client, code);
    await client.query(
      `INSERT INTO ops.expenses (flight_id, category, description, amount, currency, status, author_email)
       SELECT $1, $2, $3, $4, $5, $6, $7
       WHERE NOT EXISTS (SELECT 1 FROM ops.expenses WHERE flight_id = $1 AND category = $2)`,
      [flight, category, description, amount, currency, status, author],
    );
  }

  for (const [registration, title, dueDate, dueHours, status] of company.inspections) {
    const aircraft = await aircraftId(client, registration);
    await client.query(
      `INSERT INTO maint.inspections (aircraft_id, title, due_date, due_hours, status)
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (SELECT 1 FROM maint.inspections WHERE aircraft_id = $1 AND title = $2)`,
      [aircraft, title, dueDate, dueHours, status],
    );
  }

  for (const [registration, flightCode, title, description, status, reportedBy] of company.discrepancies) {
    const aircraft = await aircraftId(client, registration);
    const flight = flightCode ? await flightId(client, flightCode) : null;
    await client.query(
      `INSERT INTO maint.discrepancies (aircraft_id, flight_id, title, description, status, reported_by)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (SELECT 1 FROM maint.discrepancies WHERE aircraft_id = $1 AND title = $3)`,
      [aircraft, flight, title, description, status, reportedBy],
    );
  }

  for (const [registration, discrepancyTitle, title, status, assignedTo] of company.orders) {
    const aircraft = await aircraftId(client, registration);
    const discrepancy = await client.query(`SELECT id FROM maint.discrepancies WHERE aircraft_id = $1 AND title = $2`, [aircraft, discrepancyTitle]);
    await client.query(
      `INSERT INTO maint.work_orders (aircraft_id, discrepancy_id, title, status, assigned_to)
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (SELECT 1 FROM maint.work_orders WHERE aircraft_id = $1 AND title = $3)`,
      [aircraft, discrepancy.rows[0]?.id ?? null, title, status, assignedTo],
    );
  }

  for (const [title, narrative, anonymous, reporter, severity] of company.reports) {
    await client.query(
      `INSERT INTO sms.reports (title, narrative, anonymous, reporter_email, severity)
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (SELECT 1 FROM sms.reports WHERE title = $1)`,
      [title, narrative, anonymous, reporter, severity],
    );
  }

  for (const [title, starts, agenda, minutes, status] of company.meetings) {
    await client.query(
      `INSERT INTO comms.meetings (title, starts_at, agenda, minutes, status)
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (SELECT 1 FROM comms.meetings WHERE title = $1)`,
      [title, starts, agenda, minutes, status],
    );
  }

  for (const [code, title, category, edition, language, status] of company.library) {
    await client.query(
      `INSERT INTO library.documents (code, title, category, edition, language, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO NOTHING`,
      [code, title, category, edition, language, status],
    );
  }
}
