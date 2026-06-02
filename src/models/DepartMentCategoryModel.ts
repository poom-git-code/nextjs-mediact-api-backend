import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from "../config/database";
import CategoryMasterModel from './CategoryMasterModel';
import SubCategoryMasterModel from './SubCategoryMasterModel';

interface DepartMentCategoryAttributes {
  id: number;
  department_id: number;
  category_id: number;
  sub_category_id?: number | null;
  is_primary?: number;
  display_order?: number;
  effective_start?: Date | null;
  effective_end?: Date | null;
  is_active?: number;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

interface DepartMentCategoryCreationAttributes extends Optional<DepartMentCategoryAttributes, 'id' | 'sub_category_id' | 'is_primary' | 'display_order' | 'effective_start' | 'effective_end' | 'is_active' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'> { }

class DepartMentCategoryModel extends Model<DepartMentCategoryAttributes, DepartMentCategoryCreationAttributes> implements DepartMentCategoryAttributes {
  public id!: number;
  public department_id!: number;
  public category_id!: number;
  public sub_category_id?: number | null;
  public is_primary?: number;
  public display_order?: number;
  public effective_start?: Date | null;
  public effective_end?: Date | null;
  public is_active?: number;
  public created_by?: number | null;
  public updated_by?: number | null;
  public created_at?: Date;
  public updated_at?: Date;
}

DepartMentCategoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'อ้าง staff_department.id'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'อ้าง category_master.id'
    },
    sub_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'อ้าง sub_category_master.id (ถ้ามี)'
    },
    is_primary: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: '1=หมวดหลักของ department'
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    effective_start: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    effective_end: {
      type: DataTypes.DATEONLY,
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
    tableName: 'department_category',
    sequelize,
    timestamps: false,
    underscored: true
  }
);

DepartMentCategoryModel.belongsTo(CategoryMasterModel, {
  foreignKey: 'category_id',
  as: 'category'
});

DepartMentCategoryModel.belongsTo(SubCategoryMasterModel, {
  foreignKey: 'sub_category_id',
  as: 'sub_category'
});

export default DepartMentCategoryModel;
