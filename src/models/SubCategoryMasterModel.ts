import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from "../config/database";

interface SubCategoryMasterAttributes {
  id: number;
  category_id: number;
  code: string;
  name_th: string;
  name_en: string;
  description?: string | null;
  is_active?: number;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

interface SubCategoryMasterCreationAttributes extends Optional<SubCategoryMasterAttributes, 'id' | 'description' | 'is_active' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'> {}

class SubCategoryMasterModel extends Model<SubCategoryMasterAttributes, SubCategoryMasterCreationAttributes> implements SubCategoryMasterAttributes {
  public id!: number;
  public category_id!: number;
  public code!: string;
  public name_th!: string;
  public name_en!: string;
  public description?: string | null;
  public is_active?: number;
  public created_by?: number | null;
  public updated_by?: number | null;
  public created_at?: Date;
  public updated_at?: Date;
}

SubCategoryMasterModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'อ้าง category_master.id (ไม่บังคับ FK)'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name_th: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'sub_category_master',
    sequelize,
    timestamps: false,
    underscored: true,
    indexes: [
      {
        name: 'uq_cat_code',
        unique: true,
        fields: ['category_id', 'code']
      },
      {
        name: 'idx_cat',
        fields: ['category_id']
      },
      {
        name: 'idx_active',
        fields: ['is_active']
      }
    ]
  }
);

export default SubCategoryMasterModel;
