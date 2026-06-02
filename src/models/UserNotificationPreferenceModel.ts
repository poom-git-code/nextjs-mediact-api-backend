import { Model, DataTypes, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { UserModel } from './UserModel';
import PreferenceKeyTypeModel from './PreferenceKeyTypeModel';

export class UserNotificationPreferenceModel extends Model {
    public id!: number;
    public user_id!: number;
    public preference_key!: string;
    public key_type_id!: number | null;
    public is_enabled!: boolean;

    // Timestamps
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public readonly user?: UserModel;
    public readonly key_type?: PreferenceKeyTypeModel;

    public static associations: {
        user: Association<UserNotificationPreferenceModel, UserModel>;
        key_type: Association<UserNotificationPreferenceModel, PreferenceKeyTypeModel>;
    };
}

UserNotificationPreferenceModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        preference_key: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'กุญแจของการตั้งค่า เช่น jobs_facility_123',
        },
        key_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'preference_key_types',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            comment: 'FK to preference_key_types',
        },
        is_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'true (เปิดรับ), false (ปิดรับ)',
        },
    },
    {
        sequelize,
        tableName: 'user_notification_preferences',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'preference_key'],
                name: 'idx_user_pref_unique',
            },
            {
                fields: ['key_type_id'],
                name: 'idx_key_type_id',
            },
        ],
        comment: 'เก็บการตั้งค่าการรับ Notification ของ User',
    }
);

// Associations
UserNotificationPreferenceModel.belongsTo(UserModel, {
    as: 'user',
    foreignKey: 'user_id',
    targetKey: 'id',
});

UserNotificationPreferenceModel.belongsTo(PreferenceKeyTypeModel, {
    as: 'key_type',
    foreignKey: 'key_type_id',
    targetKey: 'id',
});

PreferenceKeyTypeModel.hasMany(UserNotificationPreferenceModel, {
    as: 'preferences',
    foreignKey: 'key_type_id',
    sourceKey: 'id',
});

export default UserNotificationPreferenceModel;