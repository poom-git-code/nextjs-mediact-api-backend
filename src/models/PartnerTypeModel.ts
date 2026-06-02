import { DataType, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import AdPartnerModel from "./AdPartnerModel";

export class PartnerTypeModel extends Model {
    public id!: number;
    public name!: string;
    public description!: string;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;
}

PartnerTypeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: "Unique identifier for the partner type"
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "Name of the partner type"
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Description of the partner type",
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Type status: true = active, false = inactive",
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "ID of the user who created the partner type",
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "ID of the user who last updated the partner type",
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "Timestamp when partner type was created",
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "Timestamp when the partner type was last updated",
        },
    },
    {
        sequelize,
        tableName: "partner_type",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        comment: "Table for partner types"
    }
);

// PartnerTypeModel.hasMany(AdPartnerModel, {
//     foreignKey: "partner_type_id",
//     as: "partners",
//     sourceKey: "id",
// });

export default PartnerTypeModel;