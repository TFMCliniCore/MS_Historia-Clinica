const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ------------------------------------------------------------------------------------------------------------------------------------------
// NOTA: Este seed está diseñado para ejecutarse de forma aislada.
// Si ms-entidades está disponible, intentará obtener pacientes/sucursales reales.
// Si NO está disponible, creará datos de prueba locales en la BD de historia-clinica.
// ------------------------------------------------------------------------------------------------------------------------------------------

async function fetchWithTimeout(url, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function tryFetchRemoteData() {
  const MS_ENTIDADES_URL = process.env.MS_ENTIDADES_URL || 'http://localhost:3001/api/v1';
  const base = MS_ENTIDADES_URL.replace(/\/api\/v1$/, '');

  try {
    console.log('?? Intentando conectarse a ms-entidades para obtener datos reales...');
    const [pacientes, sucursales] = await Promise.all([
      fetchWithTimeout(`${base}/pacientes`, 3000),
      fetchWithTimeout(`${base}/sucursales`, 3000),
    ]);

    if (pacientes.length >= 1 && sucursales.length >= 1) {
      console.log(`? Datos remotos obtenidos: ${pacientes.length} pacientes, ${sucursales.length} sucursales`);
      return { pacientes, sucursales, source: 'remote' };
    }
    throw new Error('Datos insuficientes');
  } catch (err) {
    console.log('??  ms-entidades no disponible o sin datos. Usando datos de prueba locales.');
    return null;
  }
}

async function createLocalTestData() {
  console.log('?? Creando datos de prueba locales en la BD de historia-clinica...');

  // IDs ficticios para datos de prueba local
  const pacienteId = 1;
  const sucursalId = 1;
  const clienteId = 1;

  // Verificar si ya existen historias
  const count = await prisma.historiaClinica.count();
  if (count > 0) {
    console.log('??  Ya existen historias clínicas. Omitiendo seed.');
    return { pacientes: [{ id: pacienteId, cliente: { id: clienteId } }], sucursales: [{ id: sucursalId }], source: 'local' };
  }

  // Crear 2 historias de ejemplo
  const h1 = await prisma.historiaClinica.create({
    data: {
      fecha: new Date('2026-04-10T10:00:00'),
      pacienteId,
      sucursalId,
      motivo: 'Revisión general anual',
      sintomas: 'Sin síntomas aparentes',
      diagnostico: 'Paciente sano',
      tratamiento: 'Desparasitación interna y externa',
      notas: 'Próxima vacuna en 3 meses',
      costo: 85000,
      pagado: true,
      formaPago: 'Efectivo',
    },
  });

  const h2 = await prisma.historiaClinica.create({
    data: {
      fecha: new Date('2026-04-20T14:00:00'),
      pacienteId,
      sucursalId,
      motivo: 'Vómito y decaimiento',
      sintomas: 'Vómito 3 veces, sin apetito desde ayer',
      diagnostico: 'Gastroenteritis leve',
      tratamiento: 'Metronidazol 250mg cada 12h por 5 días, dieta blanda',
      notas: 'Revisar en 5 días si persisten síntomas',
      costo: 120000,
      pagado: false,
    },
  });

  // Adjuntos de ejemplo
  await prisma.adjunto.createMany({
    data: [
      {
        pacienteId,
        clienteId,
        historiaClinicaId: h1.id,
        nombreArchivo: 'seed-local-1.jpg',
        nombreOriginal: 'foto_consulta_1.jpg',
        mimeType: 'image/jpeg',
        size: 0,
        url: '/uploads/seed-local-1.jpg',
        descripcion: 'Foto de referencia (seed local)',
      },
      {
        pacienteId,
        clienteId,
        historiaClinicaId: h2.id,
        nombreArchivo: 'seed-local-2.jpg',
        nombreOriginal: 'foto_consulta_2.jpg',
        mimeType: 'image/jpeg',
        size: 0,
        url: '/uploads/seed-local-2.jpg',
        descripcion: 'Foto de referencia (seed local)',
      },
    ],
  });

  console.log(`? Historias creadas: 2 | Adjuntos de referencia: 2 (datos locales)`);
  return { pacientes: [{ id: pacienteId, cliente: { id: clienteId } }], sucursales: [{ id: sucursalId }], source: 'local' };
}

async function main() {
  console.log('Iniciando seed de ms-historia-clinica...');

  let data = await tryFetchRemoteData();
  if (!data) {
    data = await createLocalTestData();
  }

  // Si obtuvimos datos remotos, crear historias con ellos
  if (data && data.source === 'remote') {
    if (await prisma.historiaClinica.count()) {
      console.log('Seed ya aplicado. Omitiendo.');
      return;
    }

    const { pacientes, sucursales } = data;

    const h1 = await prisma.historiaClinica.create({
      data: {
        fecha: new Date('2026-04-10T10:00:00'),
        pacienteId: pacientes[0].id,
        sucursalId: sucursales[0].id,
        motivo: 'Revisión general anual',
        sintomas: 'Sin síntomas aparentes',
        diagnostico: 'Paciente sano',
        tratamiento: 'Desparasitación interna y externa',
        notas: 'Próxima vacuna en 3 meses',
        costo: 85000,
        pagado: true,
        formaPago: 'Efectivo',
      },
    });

    const h2 = await prisma.historiaClinica.create({
      data: {
        fecha: new Date('2026-04-20T14:00:00'),
        pacienteId: pacientes[1]?.id || pacientes[0].id,
        sucursalId: sucursales[0].id,
        motivo: 'Vómito y decaimiento',
        sintomas: 'Vómito 3 veces, sin apetito desde ayer',
        diagnostico: 'Gastroenteritis leve',
        tratamiento: 'Metronidazol 250mg cada 12h por 5 días, dieta blanda',
        notas: 'Revisar en 5 días si persisten síntomas',
        costo: 120000,
        pagado: false,
      },
    });

    // Adjuntos (requieren clienteId, que viene en pacientes[0].cliente.id)
    await prisma.adjunto.createMany({
      data: [
        {
          pacienteId: pacientes[0].id,
          clienteId: pacientes[0].cliente?.id || 1,
          historiaClinicaId: h1.id,
          nombreArchivo: 'seed-remote-1.jpg',
          nombreOriginal: 'foto_consulta_1.jpg',
          mimeType: 'image/jpeg',
          size: 0,
          url: '/uploads/seed-remote-1.jpg',
          descripcion: 'Foto de referencia (seed remoto)',
        },
        ...(pacientes[1] ? [{
          pacienteId: pacientes[1].id,
          clienteId: pacientes[1].cliente?.id || 1,
          historiaClinicaId: h2.id,
          nombreArchivo: 'seed-remote-2.jpg',
          nombreOriginal: 'foto_consulta_2.jpg',
          mimeType: 'image/jpeg',
          size: 0,
          url: '/uploads/seed-remote-2.jpg',
          descripcion: 'Foto de referencia (seed remoto)',
        }] : []),
      ],
    });

    console.log(`? Historias creadas: 2+ | Adjuntos de referencia: 2 (datos remotos)`);
  }

  console.log(`?? Seed completado exitosamente (fuente: ${data.source})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('? Error ejecutando el seed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
