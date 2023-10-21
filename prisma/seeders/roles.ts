import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const ownerId = uuidv4();
    await prisma.roles.upsert({
        where: { id: ownerId },
        update: {},
        create: {
            id: ownerId,
            name: "pemilik",
            description: "Pemilik Toko",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const employeeId = uuidv4();
    await prisma.roles.upsert({
        where: { id: employeeId },
        update: {},
        create: {
            id: employeeId,
            name: "karyawan",
            description: "Karyawan Toko",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });
}

export { main }