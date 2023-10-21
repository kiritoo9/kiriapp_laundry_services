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

    let data = await prisma.users.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: {
            created_at: 'desc'
        },
        select: {
            id: true,
            usercode: true,
            email: true,
            fullname: true,
            phone: true,
            address: true,
            is_active: true
        },
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    usercode: {
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

    let count = await prisma.users.count({
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    usercode: {
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

async function getUserById(id: string) {
    const data = await prisma.users.findFirst({
        where: {
            deleted: false,
            id
        },
    });
    return data;
}

async function getUserByEmail(email: string, id: any = null) {
    let where: any = {
        deleted: false,
        email
    }
    if (id) where['id'] = id;
    const data = await prisma.users.findFirst({ where });
    return data;
}

async function getRoleByUser(user_id: string) {
    return await prisma.user_roles.findFirst({
        where: {
            user_id: user_id
        },
        include: {
            roles: {
                select: {
                    name: true
                }
            }
        }
    })
}

async function createUser(data: any) {
    try {
        return await prisma.users.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function createUserRole(data: any) {
    try {
        return await prisma.user_roles.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function updateUser(data: any) {
    try {
        return await prisma.users.update({
            where: {
                id: data?.id
            },
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function updateUserRole(data: any) {
    try {
        return await prisma.user_roles.updateMany({
            where: {
                user_id: data?.user_id
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
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    createUserRole,
    updateUserRole,
    getRoleByUser
}