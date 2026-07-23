/**
 * @file seed.ts
 * @description Script de seed para poblar la base de datos con datos iniciales.
 *              Crea el usuario auditor principal si no existe solo para docker .
 */
import { PrismaClient, RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed de la base de datos...');

  // Usuario Auditor Principal
  const auditorEmail = 'auditor@cosasdecasa.com';
  const auditorExistente = await prisma.usuario.findUnique({
    where: { correo: auditorEmail },
  });

  if (!auditorExistente) {
    const passwordHash = await bcrypt.hash('contrasenia_auditor_2026', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Auditor Principal',
        correo: auditorEmail,
        passwordHash,
        rol: RolUsuario.AUDITOR,
      },
    });
    console.log('✅ Usuario auditor creado:', auditorEmail);
  } else {
    console.log('ℹ️  Usuario auditor ya existe, se omite.');
  }

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
