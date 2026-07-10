const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.usuario.findMany({
    include: { perfil: true }
  });
  console.log(users.map(u => ({
    id: u.id,
    rol: u.rol,
    perfilId: u.perfil?.id,
    nombre: u.nombre
  })));
}
main().finally(() => prisma.$disconnect());
