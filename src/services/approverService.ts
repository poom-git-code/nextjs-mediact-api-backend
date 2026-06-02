import { Transaction } from "sequelize"
import ApproverModel from "../models/ApproverModel"
import UserModel from "../models/UserModel"

export const getAllApprovers = async () => {
    return await ApproverModel.findAll({
        order: [['first_name', 'ASC']]
    })
}

export const getApproverByUserId = async (userId: number) => {
    return await ApproverModel.findOne({
        where: {
            user_id: userId
        }
    })
}

export const createApprover = async (
    data: {
        user_id: number,
        user_name: string,
        email?: string,
        first_name: string,
        last_name: string,
        phone_number?: string,
    }, userId: number
) => {
    return await ApproverModel.create({
        ...data,
        is_active: true,
        created_by: userId,
        updated_by: userId
    })
}

export const updateApprover = async (
    id: number,
    data: {
        first_name?: string,
        last_name?: string,
        email?: string,
        phone_number?: string,
        is_active?: boolean,
    },
    userId: number
) => {
    const approver = await ApproverModel.findByPk(id)
    if (!approver) throw new Error('Approver not found')

    await approver.update({ ...data, updated_by: userId });
    return approver
}

export const deactiveApprover = async (id: number, userId: number) => {
    const approver = await ApproverModel.findByPk(id)
    if (!approver) throw new Error('Approver not found')

    approver.is_active = false
    approver.updated_by = userId
    await approver.save()
    return approver
}

export const createApproverFromUser = async (
    userId: number,
    adminId: number, // คนที่ทำการเพิ่ม approver
    transaction?: Transaction
) => {
    // 1. ตรวจสอบว่าผู้ใช้นั้นมีอยู่
    const user = await UserModel.findByPk(userId, { transaction });
    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

    // 2. ตรวจสอบว่ามี approver แล้วหรือยัง
    const existing = await ApproverModel.findOne({ where: { user_id: userId }, transaction });
    if (existing) {
        throw new Error(`User with ID ${userId} is already an approver`);
    }

    // 3. สร้าง Approver ใหม่จากข้อมูล user
    const approver = await ApproverModel.create(
        {
            user_id: user.id,
            user_name: user.username,
            email: user.email || null,
            first_name: user.first_name || '', // ต้องมี field นี้ใน users table หรือใส่ fallback
            last_name: user.last_name || '',
            phone_number: user.phone_number || null,
            is_active: true,
            created_by: adminId,
            updated_by: adminId,
        },
        { transaction }
    );

    return approver;
};