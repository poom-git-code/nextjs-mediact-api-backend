import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import NotificationRecipientEventModel from "./NotificationRecipientEventsModel";

class NotificationBoothEventModel extends Model {
    public id!: number;
    public title!: string;
    public content!: string;
    public start_datetime!: Date;
    public end_datetime!: Date;
    public is_active!: boolean;
    public registration_limit!: number | null;

    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;
}

NotificationBoothEventModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: "Primary key: Unique ID of each notification",
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "Title of the notification",
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Body/content of the notification",
        },
        start_datetime: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "Start date/time when notification becomes active",
        },
        end_datetime: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "End date/time when notification expires",
        },
        registration_limit: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: "Maximum number of registrants allowed. NULL means no limit.",
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Whether the notification is currently active",
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "User ID of the creator",
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "User ID of the last updater",
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: "Creation timestamp",
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: "Last update timestamp",
        },
    },
    {
        sequelize,
        tableName: "notification_booth_events",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        comment: "Master table for notifications",
    }
);

NotificationBoothEventModel.hasMany(NotificationRecipientEventModel, {
    foreignKey: "notification_id",
    as: "recipients",
    sourceKey: "id",
});

export default NotificationBoothEventModel;
