import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class FacilityAdminModel extends Model {
  public id!: number;
  public facility_id!: number;
  public user_id!: number;
  public assigned_at!: Date;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

FacilityAdminModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key',
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID ของ Facility',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID ของ Partner Admin',
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'วันที่เริ่มเป็นผู้ดูแล',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'สถานะการเป็นผู้ดูแล: 1 = ใช้งานอยู่, 0 = ไม่ใช้งาน',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ผู้สร้างข้อมูล',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ผู้แก้ไขล่าสุด',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'วันที่สร้างข้อมูล',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'วันที่แก้ไขล่าสุด',
    },
  },
  {
    sequelize,
    tableName: 'facility_admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for facility admin assignments',
  }
);

export default FacilityAdminModel;
