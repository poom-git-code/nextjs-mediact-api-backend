import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class EventCreditTypeModel extends Model {
    public id!: number;
    public name!: string;
    public full_name!: string | null;
}

EventCreditTypeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "uk_credit_types_name",
            comment: "ชื่อย่อของหน่วยกิต เช่น CME, CNEU",
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "ชื่อเต็มของหน่วยกิต",
        },
    },
    {
        sequelize,
        tableName: "event_credit_types",
        timestamps: false,
        comment: "ตารางเก็บประเภทของหน่วยกิต",
    }
);

export default EventCreditTypeModel;