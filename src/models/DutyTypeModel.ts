import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class DutyTypeModel extends Model {
  public id!: number;
  public code!: string;
  public name!: string;
  public description!: string | null;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by!: number | null;
  public updated_by!: number | null;

  // Virtual fields for associations
  public Creator?: any;
  public Updater?: any;
}

DutyTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique string code (e.g., shift, leave)',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Display name of the duty type (e.g., เข้าเวร, ลา)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description or purpose of this duty type',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this type is active/usable',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record creation timestamp',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record last update timestamp',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID who created this record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID who last updated this record',
    },
  },
  {
    sequelize,
    modelName: 'DutyType',
    tableName: 'duty_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Master table for types of user duty entries',
    indexes: [
      {
        name: 'idx_duty_types_code',
        fields: ['code'],
      },
      {
        name: 'idx_duty_types_name',
        fields: ['name'],
      },
      {
        name: 'idx_duty_types_is_active',
        fields: ['is_active'],
      },
      {
        name: 'idx_duty_types_created_by',
        fields: ['created_by'],
      },
      {
        name: 'idx_duty_types_updated_by',
        fields: ['updated_by'],
      },
    ],
  }
);

export default DutyTypeModel;
