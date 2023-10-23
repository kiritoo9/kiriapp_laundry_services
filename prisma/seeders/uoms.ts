import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const kiloId = uuidv4();
    await prisma.categories.upsert({
        where: { id: kiloId },
        update: {},
        create: {
            id: kiloId,
            name: "kg",
            description: "Kilogram",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const literId = uuidv4();
    await prisma.categories.upsert({
        where: { id: literId },
        update: {},
        create: {
            id: literId,
            name: "lt",
            description: "Liter",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const satuanId = uuidv4();
    await prisma.categories.upsert({
        where: { id: satuanId },
        update: {},
        create: {
            id: satuanId,
            name: "pcs",
            description: "Satuan",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });
}

export { main }