import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";
import CategoryMasterModel from "./CategoryMasterModel";
import SubCategoryMasterModel from "./SubCategoryMasterModel";

export class UserExperienceModel extends Model {
  public id!: number;
  public user_id!: number;
  public experience_years!: number;
  public experience_months!: number;
  public occupation_name!: string;
  public occupation_place!: string;
  public category_master_id!: number;
  public sub_category_master_id!: number;
  public created_at!: Date;
  public updated_at!: Date;

  public user?: UserModel;
  public category_master?: CategoryMasterModel;
  public sub_category_master?: SubCategoryMasterModel;

  public static associations: {
    user: Association<UserExperienceModel, UserModel>;

    category_master: Association<UserExperienceModel, CategoryMasterModel>;
    sub_category_master: Association<UserExperienceModel, SubCategoryMasterModel>;
  };
}

UserExperienceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each user experience record",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Foreign key reference to users table",
    },
    experience_years: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of years of experience",
    },
    experience_months: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of months of experience",
      validate: {
        min: 0,
        max: 11
      }
    },
    occupation_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Name of the occupation/job title",
    },
    occupation_place: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Name of the workplace/organization",
    },
    category_master_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Foreign key reference to category_master table",
    },
    sub_category_master_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Foreign key reference to sub_category_master table",
    },
  },
  {
    sequelize,
    tableName: "user_experience",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing user work experience records",
  }
);

// Define associations
UserExperienceModel.belongsTo(UserModel, {
  as: "user",
  foreignKey: "user_id",
  targetKey: "id",
});

UserModel.hasMany(UserExperienceModel, {
  as: "user_experiences",
  foreignKey: "user_id",
  sourceKey: "id",
});

export default UserExperienceModel;
