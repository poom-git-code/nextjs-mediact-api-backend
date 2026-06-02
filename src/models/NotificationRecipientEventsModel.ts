import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import NotificationBoothEventModel from "./NotificationBoothEventsModel";
import UserModel from "./UserModel";

export class NotificationRecipientEventModel extends Model {
    public id!: number;
    public notification_id!: number;
    public user_id!: number;
    public is_read!: boolean;
    public read_at!: Date | null;
    public responded!: boolean;
    public responded_at!: Date | null;
    public is_selected!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public notification?: NotificationBoothEventModel;
    public user?: UserModel;

    public static associations: {
        notification: Association<NotificationRecipientEventModel, NotificationBoothEventModel>;
        user: Association<NotificationRecipientEventModel, UserModel>;
    };
}

NotificationRecipientEventModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: "Unique ID of each recipient record",
        },
        notification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Reference to notifications table",
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "User who receives the notification",
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Whether the user has read/opened the notification",
        },
        read_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "Timestamp when user read the notification",
        },
        responded: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Whether the user has responded or acknowledged",
        },
        responded_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "Timestamp of user response",
        },
        is_selected: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "True if user should not receive this notification again after selection",
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
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "notification_recipient_events",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        comment: "Link between notifications and users who receive them",
    }
);

// Associations
// NotificationRecipientEventModel.belongsTo(NotificationBoothEventModel, {
//     foreignKey: "notification_id",
//     as: "notification",
// });

NotificationRecipientEventModel.belongsTo(UserModel, {
    foreignKey: "user_id",
    as: "user",
});

export default NotificationRecipientEventModel;
