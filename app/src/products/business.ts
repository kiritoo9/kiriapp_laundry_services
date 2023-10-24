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

    let data = await prisma.products.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: {
            created_at: 'asc'
        },
        include: {
            categories: {
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

    let count = await prisma.products.count({
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

async function getProductById(id: string) {
    return await prisma.products.findFirst({
        where: {
            deleted: false,
            id
        },
        include: {
            categories: {
                select: {
                    name: true,
                    description: true
                }
            }
        },
    });
}

async function createProduct(data: any) {
    try {
        return await prisma.products.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function createProductMaterial(data: any) {
    try {
        return await prisma.product_materials.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function updateProduct(data: any) {
    try {
        return await prisma.products.update({
            where: {
                id: data.id
            },
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function getMaterialsByProduct(product_id: string) {
    try {
        return await prisma.product_materials.findMany({
            where: {
                deleted: false,
                product_id
            },
            include: {
                materials: {
                    select: {
                        name: true,
                        description: true,
                        buy_price: true,
                        stock: true,
                        photo: true,
                        max_usage: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

async function deleteProductMaterialByProduct(product_id: string) {
    try {
        return await prisma.product_materials.updateMany({
            where: {
                product_id
            },
            data: {
                deleted: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export {
    getLists,
    getCount,
    getProductById,
    createProduct,
    updateProduct,
    createProductMaterial,
    getMaterialsByProduct,
    deleteProductMaterialByProduct
}