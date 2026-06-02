import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import CertificationModel from "./CertificationModel";
import InstitutionModel from "./InstitutionModel";

export class UserCertificationModel extends Model {
  public id!: number;
  public user_id!: number;
  public certification_id!: number;
  public institution_id!: number;
  public document_url!: string | null;
  public document_id!: string | null;
  // public document_number!: string | null;
  public start_date!: Date | null;
  public graduate_date!: Date | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;

  public certification_info?: CertificationModel;
  public institution_info?: InstitutionModel;

  public static associations: {
    certification_info: Association<UserCertificationModel, CertificationModel>;
    institution_info: Association<UserCertificationModel, InstitutionModel>;
  };
}

UserCertificationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each user certification record",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "User ID who owns this certification",
    },
    certification_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Certification ID from the certifications table",
    },
    institution_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Institution ID where the certification was obtained",
    },
    document_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: "URL to the supporting document (e.g., certificate)",
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Identifier for the document in the storage system",
    },
    // document_number: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true,
    //   comment: "Auto-generated document number (e.g., SPL_CERT_24_0001)",
    // },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when the education or certification started",
    },
    graduate_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when the education or certification was completed",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Record status: 1 = active, 0 = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the creator who created this record",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the last updater who updated this record",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when the user certification record was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when the user certification record was last updated",
    },
  },
  {
    sequelize,
    tableName: "user_certifications",
    timestamps: false,
    comment: "Table for storing user certifications",
  }
);

// Associations
UserCertificationModel.belongsTo(CertificationModel, {
  as: "certification_info",
  foreignKey: "certification_id",
  targetKey: "id",
});
UserCertificationModel.belongsTo(InstitutionModel, {
  as: "institution_info",
  foreignKey: "institution_id",
  targetKey: "id",
});

export default UserCertificationModel;
