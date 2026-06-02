import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class JobCertificationModel extends Model {
  public id!: number;
  public job_id!: number;
  public certification_id!: number;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

JobCertificationModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    certification_id: { type: DataTypes.INTEGER, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "job_certifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for job required certifications",
  }
);

export default JobCertificationModel;