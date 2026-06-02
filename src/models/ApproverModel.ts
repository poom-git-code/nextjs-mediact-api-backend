import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ApproverModel extends Model {
    public id!: number;
    public user_id!: number;
    public username!: string | null;
    public email!: string | null;
    public first_name!: string;
    public last_name!: string;
    public phone_number!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;
}

ApproverModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Unique ID for each approver',
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'User ID from users table (soft link)',
        },
        username: {
            type: DataTypes.STRING(50),
            defaultValue: "",
            allowNull: true,
            comment: 'Username at the time of being assigned as approver',
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Email at the time of approval assignment',
        },
        first_name: {
            type: DataTypes.STRING(60),
            allowNull: false,
            comment: 'First name of the approver',
        },
        last_name: {
            type: DataTypes.STRING(60),
            allowNull: false,
            comment: 'Last name of the approver',
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Phone number of the approver (optional)',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'True = active approver, False = disabled',
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
            comment: 'Timestamp when the record was created',
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the record was last updated',
        },
    },
    {
        sequelize,
        tableName: 'approvers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        comment: 'List of users assigned as approvers',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    }
);

export default ApproverModel;
