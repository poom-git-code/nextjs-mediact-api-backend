import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class PreferenceKeyTypeModel extends Model {
    public id!: number;
    public type_code!: string;
    public type_name_th!: string;
    public type_name_en!: string | null;
    public is_active!: boolean;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

PreferenceKeyTypeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'รหัสสำหรับ Logic (เช่น PUSH, EMAIL, IN_APP)',
        },
        type_name_th: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'ชื่อประเภท (ภาษาไทย)',
        },
        type_name_en: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'ชื่อประเภท (ภาษาอังกฤษ)',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'preference_key_types',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        comment: 'ตารางเก็บประเภทหมวดหมู่ของ Preference Key',
    }
);

export default PreferenceKeyTypeModel;
