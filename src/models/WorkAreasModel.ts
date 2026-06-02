import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class WorkAreasModel extends Model {
  public id!: number;
  public user_id!: number;
  public province_code!: number;
  public district!: string;
  public job_type_id!: number | null;
  public facility_type_id!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

WorkAreasModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each work area",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to the users table",
    },
    province_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to the provinces table for easier querying",
    },
    district: {
      type: DataTypes.STRING(400),
      allowNull: false,
      comment: "FK to the districts table that the user selected (can store single id or csv/json string)",
    },
    job_type_id: {
      type: DataTypes.STRING(400), 
      allowNull: true,
      comment: "id document ที่อยู่ของประเภทงานจากตาราง job_types",
    },
    facility_type_id: {
      type: DataTypes.STRING(400), 
      allowNull: true,
      comment: "id document ที่อยู่ของประเภท facility จากตาราง facility_types",
    },

  },
  {
    sequelize,
    tableName: "work_areas",

    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Stores the specific districts a user can work in.",
    indexes: [
      { name: "idx_user_id", fields: ["user_id"] },
      { name: "idx_province_code", fields: ["province_code"] },
      { name: "idx_job_type_id", fields: ["job_type_id"] },
      { name: "idx_facility_type_id", fields: ["facility_type_id"] },
    ],
  }
);

export default WorkAreasModel;