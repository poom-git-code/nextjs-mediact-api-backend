import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

import type DepartmentModel from './DepartmentModel';
import type DepartmentCertificationModel from './DepartmentCertificationModel';

export class CertificationModel extends Model {
  public id!: number;
  public name_th!: string;
  public name_en!: string;
  public role_id!: number;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;

  public departments?: DepartmentModel[];
}

CertificationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each certification",
    },
    name_th: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Certification name in Thai",
    },
    name_en: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Certification name in English",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Role ID that this certification is associated with",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Status: 1 = active, 0 = inactive",
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
      comment: "Timestamp when the certification record was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when the certification record was last updated",
    },
  },
  {
    sequelize,
    tableName: "certifications",
    timestamps: false,
    comment: "Table for storing certifications",
  }
);

import RoleModel from "./RolesModel";

// CertificationModel.belongsTo(RoleModel, {
//   as: "role",
//   foreignKey: "role_id",
//   targetKey: "id",
// });

// CertificationModel.belongsToMany(DepartmentModel, {
//   through: DepartmentCertificationModel,
//   foreignKey: 'certification_id',     
//   otherKey: 'department_id',        
//   as: 'departments',                
// });

export default CertificationModel;
