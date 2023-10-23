import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const bajuId = uuidv4();
    await prisma.categories.upsert({
        where: { id: bajuId },
        update: {},
        create: {
            id: bajuId,
            name: "Baju",
            description: "Baju Saja",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const selimutId = uuidv4();
    await prisma.categories.upsert({
        where: { id: selimutId },
        update: {},
        create: {
            id: selimutId,
            name: "Selimut",
            description: "Selimut atau bedcover",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const generalId = uuidv4();
    await prisma.categories.upsert({
        where: { id: generalId },
        update: {},
        create: {
            id: generalId,
            name: "Umum",
            description: "Kategori umum",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });
}

export { main }