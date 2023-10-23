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

    let data = await prisma.customers.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: {
            created_at: 'asc'
        },
        select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
            address: true,
            gender: true
        },
        where: {
            OR: [
                {
                    deleted: false,
                    fullname: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    email: {
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

    let count = await prisma.customers.count({
        where: {
            OR: [
                {
                    deleted: false,
                    fullname: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    email: {
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

async function getCustomerById(id: string) {
    return await prisma.customers.findFirst({
        where: {
            deleted: false,
            id
        }
    });
}

async function createCustomer(data: any) {
    try {
        return await prisma.customers.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function updateCustomer(data: any) {
    try {
        return await prisma.customers.update({
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
    getCustomerById,
    createCustomer,
    updateCustomer
}