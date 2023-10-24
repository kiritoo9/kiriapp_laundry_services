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

    let data = await prisma.orders.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: {
            created_at: 'asc'
        },
        include: {
            customers: {
                select: {
                    fullname: true,
                    phone: true,
                    email: true,
                    address: true
                }
            }
        },
        where: {
            deleted: false,
            order_code: {
                contains: keywords
            }
        }
    });

    return data;
}

async function getCount(
    req: Request
) {
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: any = req.query?.keywords !== undefined ? req.query.keywords : "";

    let count = await prisma.orders.count({
        where: {
            deleted: false,
            order_code: {
                contains: keywords
            }
        }
    });

    let totalPage: number = 1;
    if (limit > 0 && count > 0) {
        totalPage = Math.ceil(count / limit);
    }
    return totalPage;
}

async function getOrderById(id: string) {
    return await prisma.orders.findFirst({
        where: {
            deleted: false,
            id
        },
        include: {
            customers: {
                select: {
                    fullname: true,
                    phone: true,
                    email: true,
                    address: true
                }
            }
        }
    });
}

async function createOrder(data: any) {
    try {
        return await prisma.orders.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function updateOrder(data: any) {
    try {
        return await prisma.orders.update({
            where: {
                id: data.id
            },
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function createOrderDetail(data: any) {
    try {
        return await prisma.order_details.create({
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function getCountByOrdercode(order_code: string) {
    try {
        return await prisma.orders.count({
            where: {
                deleted: false,
                order_code: {
                    contains: order_code
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

async function getDetailByOrder(order_id: string) {
    try {
        return await prisma.order_details.findMany({
            where: {
                order_id: order_id
            },
            include: {
                products: {
                    include: {
                        categories: {
                            select: {
                                name: true,
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

async function removeDetailByOrder(order_id: string) {
    try {
        return await prisma.order_details.deleteMany({
            where: {
                order_id: order_id
            }
        });
    } catch (error) {
        throw error;
    }
}

export {
    getLists,
    getCount,
    getOrderById,
    createOrder,
    updateOrder,
    createOrderDetail,
    getCountByOrdercode,
    getDetailByOrder,
    removeDetailByOrder
}