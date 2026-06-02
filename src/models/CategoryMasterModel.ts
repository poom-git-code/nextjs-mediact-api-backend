import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from "../config/database";

interface CategoryMasterAttributes {
  id: number;
  scope: 'doctor' | 'nurse' | 'both';
  code: string;
  name_th: string;
  name_en: string;
  description?: string | null;
  is_active?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

interface CategoryMasterCreationAttributes extends Optional<CategoryMasterAttributes, 'id' | 'description' | 'is_active' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'> { }

class CategoryMasterModel extends Model<CategoryMasterAttributes, CategoryMasterCreationAttributes> implements CategoryMasterAttributes {
  public id!: number;
  public scope!: 'doctor' | 'nurse' | 'both';
  public code!: string;
  public name_th!: string;
  public name_en!: string;
  public description?: string | null;
  public is_active?: boolean;
  public created_by?: number | null;
  public updated_by?: number | null;
  public created_at?: Date;
  public updated_at?: Date;
}

CategoryMasterModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    scope: {
      type: DataTypes.ENUM('doctor', 'nurse', 'both'),
      allowNull: false,
      defaultValue: 'both',
      comment: 'ใช้กับสายไหน'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  },
  {
    tableName: 'category_master',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default CategoryMasterModel;
