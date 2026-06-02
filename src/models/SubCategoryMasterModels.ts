import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from "../config/database";
import CategoryMasterModel from './CategoryMasterModel';

interface SubCategoryMasterAttributes {
    id: number;
    category_id: number;
    code: string;
    name_th: string;
    name_en: string;
    description: string | null;
    is_active: boolean;
    created_by: number | null;
    updated_by: number | null;
    created_at: Date;
    updated_at: Date;
}

interface SubCategoryMasterCreationAttributes extends Optional<SubCategoryMasterAttributes, 'id' | 'description' | 'is_active' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'> { }

class SubCategoryMasterModel extends Model<SubCategoryMasterAttributes, SubCategoryMasterCreationAttributes> implements SubCategoryMasterAttributes {
    public id!: number;
    public category_id!: number;
    public code!: string;
    public name_th!: string;
    public name_en!: string;
    public description!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

SubCategoryMasterModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'อ้าง category_master.id (ไม่บังคับ FK)',
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name_th: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        name_en: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'sub_category_master',
        sequelize,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        // underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['category_id', 'code'],
                name: 'uq_cat_code',
            },
            {
                fields: ['category_id'],
                name: 'idx_cat',
            },
            {
                fields: ['is_active'],
                name: 'idx_active',
            },
        ],
    }
);

SubCategoryMasterModel.belongsTo(CategoryMasterModel, {
    foreignKey: 'category_id',
    as: 'category'
});

export default SubCategoryMasterModel;