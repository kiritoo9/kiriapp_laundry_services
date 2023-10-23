import { main as roles } from "./seeders/roles";
import { main as configs } from "./seeders/configs";
import { main as categories } from "./seeders/categories";
import { main as uoms } from "./seeders/uoms";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        await roles();
        await configs();
        await categories();
        await uoms();
    } catch(error: any) {
        throw error;
    }
}

main().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
