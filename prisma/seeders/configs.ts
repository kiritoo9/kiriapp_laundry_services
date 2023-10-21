import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Default required configs
 * 1. company_name
 * 2. company_logo
 * 3. company_address
 */

async function main() {
    const companyNameId = uuidv4();
    await prisma.configs.upsert({
        where: { id: companyNameId },
        update: {},
        create: {
            id: companyNameId,
            config_name: "company_name",
            config_value: "",
            config_key: "",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const companyLogoId = uuidv4();
    await prisma.configs.upsert({
        where: { id: companyLogoId },
        update: {},
        create: {
            id: companyLogoId,
            config_name: "company_logo",
            config_value: "",
            config_key: "",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const companyAddressId = uuidv4();
    await prisma.configs.upsert({
        where: { id: companyAddressId },
        update: {},
        create: {
            id: companyAddressId,
            config_name: "company_address",
            config_value: "",
            config_key: "",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });
}

export { main }