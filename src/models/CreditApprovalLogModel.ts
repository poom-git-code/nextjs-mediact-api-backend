import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import CreditLogModel from './CreditLogsModel';

export class CreditApprovalLogModel extends Model {
    public id!: number;
    public credit_log_id!: number;
    public approver_id!: number;
    public approved_at!: Date;
    public status!: 'approved' | 'rejected';
    public remark!: string | null;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    // Association
    public credit_log?: CreditLogModel;
}

CreditApprovalLogModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Unique ID for each approval log',
        },
        credit_log_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to the top-up log that needs approval',
        },
        approver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Admin user ID who approved the top-up',
        },
        approved_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when approved',
        },
        status: {
            type: DataTypes.ENUM('approved', 'rejected'),
            allowNull: false,
            defaultValue: 'approved',
            comment: 'Approval status',
        },
        remark: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Optional comment or reason for approval/rejection',
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the admin or system that created the record',
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the admin or system that last updated the record',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the credit record was created',
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the credit record was last updated',
        },
    },
    {
        sequelize,
        tableName: 'credit_approval_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        comment: 'Logs for credit approval actions by admins',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    }
);

// Association
CreditApprovalLogModel.belongsTo(CreditLogModel, {
    foreignKey: 'credit_log_id',
    as: 'credit_log',
});

export default CreditApprovalLogModel;
