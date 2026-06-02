import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import CreditModel from './CreditsModel';
import CreditLogModel from './CreditLogsModel';

export class CreditRequestModel extends Model {
    public id!: number;
    public credit_id!: number;
    public credit_log_id!: number | null;
    public amount!: number;
    public request_type!: 'topup' | 'adjustment';
    public status!: 'pending' | 'approved' | 'rejected';
    public requested_by!: number;
    public approved_by!: number | null;
    public requested_at!: Date;
    public approved_at!: Date;
    public remark!: string | null;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    // Associations
    public credit?: CreditModel;
    public credit_log?: CreditLogModel;
}

CreditRequestModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Unique ID for each top-up request',
        },
        credit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to user credit wallet',
        },
        credit_log_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to the created credit log when this request was approved',
        },
        amount: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false,
            comment: 'Top-up amount requested',
        },
        request_type: {
            type: DataTypes.ENUM('topup', 'adjustment'),
            allowNull: false,
            defaultValue: 'topup',
            comment: 'Request type',
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
            comment: 'Approval status',
        },
        requested_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'User ID who requested the top-up',
        },
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Admin ID who approved or rejected the request',
        },
        requested_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
            comment: 'Datetime when request was created',
        },
        approved_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Datetime when approved or rejected',
        },
        remark: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Optional reason for rejection or notes',
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
        tableName: 'credit_requests',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        comment: 'Requests for credit top-up or adjustment',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    }
);

CreditRequestModel.belongsTo(CreditModel, {
    foreignKey: 'credit_id',
    as: 'credit',
});

CreditRequestModel.belongsTo(CreditLogModel, {
    foreignKey: 'credit_log_id',
    as: 'credit_log',
});

export default CreditRequestModel;
