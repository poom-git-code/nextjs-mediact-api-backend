import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import JobApplyModel from "./JobApplyModel";
import UserModel from "./UserModel";

export class ApplicantReviewModel extends Model {
    public id!: number;
    public job_apply_id!: number;
    public reviewer_id!: number | null;
    public rating!: number;
    public comment!: string | null;
    public is_active!: boolean;
    public created_at!: Date;

    // Associations
    public application?: JobApplyModel;
    public reviewer?: UserModel;
}

ApplicantReviewModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: "Primary Key: Unique ID for each review",
        },
        job_apply_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: "uk_job_apply_id",
            comment: "Reference to the specific application being reviewed (from job_applies.id)",
        },
        reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "User ID of the person giving the review (e.g., manager, from users.id)",
        },
        rating: {
            type: DataTypes.TINYINT,
            allowNull: false,
            comment: "Rating given (1-5 stars)",
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.STRING(2000),
            allowNull: true,
            comment: "Review comment, limited to 2000 characters",
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: "Flag for soft delete (1=active, 0=inactive)",
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: "Timestamp when the review was submitted",
        },
    },
    {
        sequelize,
        tableName: "applicant_reviews",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,

        defaultScope: {
            where: {
                is_active: true,
            },
        },

        comment: "Table to store reviews of applicants after job completion",
    }
);

export default ApplicantReviewModel;