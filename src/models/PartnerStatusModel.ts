import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class PartnerStatusModel extends Model {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

PartnerStatusModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Unique identifier for the partner status',
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'Name of the partner status',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Description of the partner status',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Type status: true = active, false = inactive',
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the user who created the record',
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the user who last updated the record',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the record was created',
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the record was last updated',
        },
    },
    {
        sequelize,
        tableName: 'partner_status',
        modelName: 'PartnerStatus',
        timestamps: false,
        underscored: true,
    }
);
