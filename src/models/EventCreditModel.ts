import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class EventCreditModel extends Model {
    public id!: number;
    public event_id!: number;
    public credit_type_id!: number;
    public score!: number;
}

EventCreditModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "FK อ้างอิงไปยังตาราง events",
        },
        credit_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "FK อ้างอิงไปยังตาราง event_credit_types",
        },
        score: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            comment: "จำนวนคะแนน/หน่วยกิตที่ได้รับ",
        },
    },
    {
        sequelize,
        tableName: "event_credits",
        timestamps: false,
        comment: "ตารางเชื่อมข้อมูลหน่วยกิตของแต่ละ Event",
        indexes: [
            {
                unique: true,
                fields: ["event_id", "credit_type_id"],
                name: "uk_event_credit",
            },
        ],
    }
);

export default EventCreditModel;