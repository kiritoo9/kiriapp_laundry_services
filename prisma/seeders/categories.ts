import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const kiloanId = uuidv4();
    await prisma.categories.upsert({
        where: { id: kiloanId },
        update: {},
        create: {
            id: kiloanId,
            name: "Kiloan",
            description: "Laundry Kiloan",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const konvensionalId = uuidv4();
    await prisma.categories.upsert({
        where: { id: konvensionalId },
        update: {},
        create: {
            id: konvensionalId,
            name: "Konvensional",
            description: "Laundry Konvensional",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const expressId = uuidv4();
    await prisma.categories.upsert({
        where: { id: expressId },
        update: {},
        create: {
            id: expressId,
            name: "Express",
            description: "Laundry Express",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });
}

export { main }