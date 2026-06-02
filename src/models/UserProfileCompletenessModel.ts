import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";

export class UserProfileCompletenessModel extends Model {
    public id!: number;
    public user_id!: number;
    public completeness_percent!: number;
    // public basic_info_percent!: number;
    // public contact_info_percent!: number;
    // public identity_info_percent!: number;
    // public security_info_percent!: number;
    public last_calculated!: Date;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;
}

UserProfileCompletenessModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: "Primary Key: Unique ID for each record",
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Reference to the users table",
        },
        completeness_percent: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.0,
            comment: "Overall profile completeness percentage",
        },
        // basic_info_percent: {
        //     type: DataTypes.DECIMAL(5, 2),
        //     defaultValue: 0.0,
        //     comment: "Completeness for basic info: name, dob, gender",
        // },
        // contact_info_percent: {
        //     type: DataTypes.DECIMAL(5, 2),
        //     defaultValue: 0.0,
        //     comment: "Completeness for email, phone",
        // },
        // identity_info_percent: {
        //     type: DataTypes.DECIMAL(5, 2),
        //     defaultValue: 0.0,
        //     comment: "Completeness for ID card/passport",
        // },
        // security_info_percent: {
        //     type: DataTypes.DECIMAL(5, 2),
        //     defaultValue: 0.0,
        //     comment: "Completeness for password, 2FA, etc",
        // },
        last_calculated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "Timestamp when completeness was last calculated",
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
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "user_profile_completeness",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        comment: "Stores calculated profile completeness score for each user",
    }
);

UserProfileCompletenessModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
    targetKey: "id",
});

export default UserProfileCompletenessModel;
