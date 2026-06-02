import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import JobModel from "./JobsModel";
import UserModel from "./UserModel";
import ApplicantReviewModel from "./ApplicantReviewModel";

export class JobApplyModel extends Model {
  public id!: number;
  public job_id!: number;
  public user_id!: number;
  public status_id!: number;
  public apply_date!: Date;
  public remark!: string | null;
  public approve_user_id!: number | null;
  public approve_date!: Date | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public job?: JobModel;
  public user?: UserModel;
  public approver?: UserModel;
  public review?: ApplicantReviewModel;
}

JobApplyModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status_id: { type: DataTypes.INTEGER, allowNull: false },
    apply_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    remark: { type: DataTypes.STRING(255), allowNull: true },
    approve_user_id: { type: DataTypes.INTEGER, allowNull: true },
    approve_date: { type: DataTypes.DATE, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: "job_applies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for job applications",
    indexes: [
      {
        unique: true,
        fields: ['job_id', 'user_id'],
        name: 'uk_job_user_apply'
      }
    ]
  }
);

JobApplyModel.belongsTo(JobModel, { as: "job", foreignKey: "job_id" });
JobApplyModel.belongsTo(UserModel, { as: "user", foreignKey: "user_id" });
JobApplyModel.belongsTo(UserModel, { as: "approver", foreignKey: "approve_user_id" });

export default JobApplyModel;