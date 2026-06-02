import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class JobTypeModel extends Model {
  public id!: number;
  public job_type_code!: string;
  public job_type_name_th!: string;
  public job_type_name_en!: string;
  public description!: string | null;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

JobTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each job type",
    },
    job_type_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "รหัสสำหรับอ้างอิงในโปรแกรม เช่น FULL_TIME, PART_TIME",
    },
    job_type_name_th: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "ชื่อประเภทงานสำหรับแสดงผล เช่น งานประจำ, งานพาร์ทไทม์",
    },
    job_type_name_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Name work type etc Full Time, Part Time",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "คำอธิบายเพิ่มเติมเกี่ยวกับประเภทงาน",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "สถานะการใช้งาน (true=ใช้งาน, false=ปิดใช้งาน)",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the job type record was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the job type record was last updated",
    },
  },
  {
    sequelize,
    tableName: "job_types",
    timestamps: false, // Using custom timestamp fields
    comment: "ตารางหลักสำหรับเก็บประเภทของงาน",
  }
);

export default JobTypeModel;