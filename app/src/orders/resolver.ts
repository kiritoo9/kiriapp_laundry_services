import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { getToken } from "../../helpers/token";

import {
    getMaterialsByProduct,
    getProductById
} from "../products/business";
import {
    createMaterialUsage,
    updateMaterial,
    getMaterialUsageByMaterial,
    updateMaterialUsageByMaterial,
    removeMaterialUsagesByDocReff
} from "../materials/business";
import {
    getLists,
    getCount,
    getOrderById,
    createOrder,
    updateOrder,
    createOrderDetail,
    getCountByOrdercode,
    getDetailByOrder,
    removeDetailByOrder
} from './business';

import Joi from "joi";
import { generateZeroNumber } from "../../helpers/generate";
const schema = Joi.object({
    customer_id: Joi.string().required(),
    notes: Joi.string().allow(null),
    details: Joi.array().items(Joi.object({
        product_id: Joi.string().required(),
        weight: Joi.number().required(),
        qty: Joi.number().required(),
        price: Joi.number().allow(null),
        is_custom_price: Joi.boolean().default(false)
    })).required()
});

async function lists(req: Request, res: Response) {
    try {
        const data = await getLists(req);
        const totalPage = await getCount(req);

        return res.status(200).json({ data, totalPage });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function detail(req: Request, res: Response) {
    try {
        let data: any = await getOrderById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        data.details = await getDetailByOrder(data.id);

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function create(req: Request, res: Response) {
    try {

        await schema.validateAsync(req.body);

        let data = req.body;
        const token = await getToken(req);

        /**
         * Generate order code
         */
        const date = new Date();
        const year: any = date.getFullYear();
        let month: any = date.getMonth() + 1;
        if (month < 10) month = `0${month}`;

        let order_code: string = `ORD/${year}/${month}/`;
        let count: number = await getCountByOrdercode(order_code);
        count += 1;
        order_code += generateZeroNumber(count, 4);

        /**
         * Calculate and validating data
         */
        let order: any = {
            id: uuidv4(),
            order_code: order_code,
            customer_id: req.body.customer_id,
            total_qty: 0,
            total_weight: 0,
            total_price: 0,
            status: "S1", // STATIC
            notes: req.body.notes,
            created_at: date,
            created_by: token?.usercode
        }

        const bodyDetails = req.body.details;
        let errMessages: string[] = [];
        let details: any = [];
        let materialUsages: any = [];

        await Promise.all(bodyDetails.map(async (v, _) => {
            /**
             * Check existing product
             */
            const product = await getProductById(v.product_id);
            if (!product) {
                errMessages.push(`Product with id: ${v.product_id} is not found`);
            } else {
                const d = {
                    id: uuidv4(),
                    order_id: order.id,
                    product_id: v.product_id,
                    weight: v.weight,
                    qty: v.qty,
                    is_custom_price: v.is_custom_price,
                    price: !v.is_custom_price ? product.price : v.price,
                    created_at: order.created_at,
                    created_by: order.created_by
                }
                order.total_qty += d.qty;
                order.total_weight += d.weight;
                order.total_price += d.price;
                details.push(d);

                /**
                 * Calculate material usages
                 */
                const materials = await getMaterialsByProduct(v.product_id);
                await Promise.all(materials.map(async (value, _) => {
                    const m = {
                        id: uuidv4(),
                        material_id: value.material_id,
                        doc_reff_usage: order.order_code,
                        total_usage: (value.total_usage ? value.total_usage : 0) * d.qty,
                        created_at: order.created_at,
                        created_by: order.created_by
                    }
                    materialUsages.push({
                        material_id: m.material_id,
                        max_usage: value?.materials?.max_usage,
                        stock: value?.materials?.stock
                    });
                    await createMaterialUsage(m);
                }));
            }
        }));

        /**
         * Handle errors
         */
        if (errMessages.length > 0) {
            let errMsgs: string = "";
            for (let i = 0; i < errMessages.length; i++) {
                errMsgs += `${errMessages[i]}\n`;
            }
            return res.status(400).json({ message: errMsgs });
        }

        /**
         * Re-Calcualte stock in materials
         * This logic didn't used yet, will use it in beta version
         */
        const USE_CALCULATE: boolean = false;
        if (USE_CALCULATE) {
            await Promise.all(materialUsages.map(async (v, _) => {
                const usages: any = await getMaterialUsageByMaterial(v.material_id, true);
                if (usages) {
                    let totalUsages: number = 0;
                    for (let i = 0; i < usages.length; i++) {
                        totalUsages += parseInt(usages[i].total_usage);
                    }
                    if (totalUsages >= parseInt(v.max_usage)) {
                        /**
                         * Reduce stock in material
                         */
                        await updateMaterial({
                            id: v.material_id,
                            stock: parseInt(v.stock) - 1,
                            updated_at: order.updated_at,
                            updated_by: order.updated_by,
                        });
                        /**
                         * Set "calculated" as true in material_usages so it won't recalculated again in next order
                         */
                        await updateMaterialUsageByMaterial({
                            material_id: v.material_id,
                            calculated: true,
                            updated_at: order.updated_at,
                            updated_by: order.updated_by,
                        });
                    }
                }
            }));
        }


        /**
         * Insert order
         */
        await createOrder(order);
        await Promise.all(details.map(async (v, _) => {
            await createOrderDetail(v);
        }));

        /**
         * Send response
         */
        return res.status(201).json({ message: "Data created", data: { order, details } });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function edit(req: Request, res: Response) {
    try {
        const data = await getOrderById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        await schema.validateAsync(req.body);
        const token = await getToken(req);

        let order: any = {
            id: data.id,
            customer_id: req.body.customer_id,
            notes: req.body.notes,
            total_qty: 0,
            total_weight: 0,
            total_price: 0,
            updated_at: new Date(),
            updated_by: token?.usercode
        }
        const bodyDetails = req.body.details;
        let errMessages: string[] = [];
        let details: any = [];

        await Promise.all(bodyDetails.map(async (v, _) => {
            /**
             * Check existing product
             */
            const product = await getProductById(v.product_id);
            if (!product) {
                errMessages.push(`Product with id: ${v.product_id} is not found`);
            } else {
                const d = {
                    id: uuidv4(),
                    order_id: order.id,
                    product_id: v.product_id,
                    weight: v.weight,
                    qty: v.qty,
                    is_custom_price: v.is_custom_price,
                    price: !v.is_custom_price ? product.price : v.price,
                    created_at: order.updated_at,
                    created_by: order.updated_by
                }
                order.total_qty += d.qty;
                order.total_weight += d.weight;
                order.total_price += d.price;
                details.push(d);

                /**
                 * Calculate material usages
                 */
                await removeMaterialUsagesByDocReff(data.order_code)
                const materials = await getMaterialsByProduct(v.product_id);
                await Promise.all(materials.map(async (value, _) => {
                    const m = {
                        id: uuidv4(),
                        material_id: value.material_id,
                        doc_reff_usage: data.order_code,
                        total_usage: (value.total_usage ? value.total_usage : 0) * d.qty,
                        created_at: order.updated_at,
                        created_by: order.updated_by
                    }
                    await createMaterialUsage(m);
                }));
            }
        }));

        /**
         * Update Order
         */
        await updateOrder(order);
        await removeDetailByOrder(order.id);
        await Promise.all(details.map(async (v, _) => {
            await createOrderDetail(v);
        }));

        return res.status(201).json({ message: "Data updated", data: { order, details } });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function editStatus(req: Request, res: Response) {
    try {
        const data = await getOrderById(req.params.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Handle unknown status
         */
        const statuses = ["S1", "S2", "S3", "S4"];
        if (!statuses.includes(req.body?.status)) return res.status(400).json({ message: "Status is unknown", status_availables: statuses });

        /**
         * Update data
         */
        await updateOrder({
            id: data.id,
            status: req.body?.status
        });
        return res.status(201).json({ message: "Order status updated" });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function remove(req: Request, res: Response) {
    try {
        const data = await getOrderById(req.params.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        await updateOrder({
            id: data.id,
            deleted: true
        });
        return res.status(201).json({ message: "Data deleted" });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

export {
    lists,
    detail,
    create,
    edit,
    editStatus,
    remove
}