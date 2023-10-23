import { Request } from "express"

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getLists(
    req: Request
) {
    let page: any = req.query?.page !== undefined ? req.query.page : 1;
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: any = req.query?.keywords !== undefined ? req.query.keywords : "";

    let offset = 0;
    if (page > 0 && limit > 0) offset = (page * limit) - limit;

    let data = await prisma.materials.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: {
            created_at: 'asc'
        },
        include: {
            uoms: {
                select: {
                    name: true,
                    description: true
                }
            }
        },
        where: {
            OR: [
                {
                    deleted: false,
                    name: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    description: {
                        contains: keywords
                    }
                }
            ]
        }
    });

    return data;
}

async function getCount(
    req: Request
) {
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: any = req.query?.keywords !== undefined ? req.query.keywords : "";

    let count = await prisma.materials.count({
        where: {
            OR: [
                {
                    deleted: false,
                    name: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    description: {
                        contains: keywords
                    }
                }
            ]
        }
    });

    let totalPage: number = 1;
    if (limit > 0 && count > 0) {
        totalPage = Math.ceil(count / limit);
    }
    return totalPage;
}

async function getMaterialById(id: string) {
    return await prisma.materials.findFirst({
        where: {
            deleted: false,
            id
        },
        include: {
            uoms: {
                select: {
                    name: true,
                    description: true
                }
            }
        }
    });
}

async function createMaterial(data: any) {
    try {
        return await prisma.materials.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function updateMaterial(data: any) {
    try {
        return await prisma.materials.update({
            where: {
                id: data.id
            },
            data: data
        });
    } catch (error) {
        throw error;
    }
}

export {
    getLists,
    getCount,
    getMaterialById,
    createMaterial,
    updateMaterial
}