import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import FacilityModel from './FacilitiesModel';
import FacilityTypeModel from './FacilityTypesModel';
import DepartmentModel from './DepartmentModel';
import DepartmentTypeModel from './DepartmentTypesModel';
import UserModel from './UserModel';

export class UserEmploymentModel extends Model {
  public id!: number;
  public user_id!: number;
  public department_id!: number;
  public facility_id!: number;
  public position_id!: string | null;
  public start_date!: Date | null;
  public end_date!: Date | null;
  public is_active!: boolean;
  public is_part_time!: boolean | null;

  public is_job_applicant!: boolean;

  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public department?: DepartmentModel; // Add user_role property
  public facility?: FacilityModel; // Add user_role property
  public user?: UserModel; // Add user property

  public static associations: {
    department: Association<DepartmentModel, DepartmentModel>;
    facility: Association<FacilityModel, FacilityModel>;
    user: Association<UserModel, UserModel>;
  };
}

UserEmploymentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each employment',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the user employed at the facility',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the department this employee belongs to',
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the facility where the user is employed',
    },
    position_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Position or title of the user at the facility (e.g., Doctor, Nurse)',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Start date of employment',
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'End date of employment (if applicable)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Employment status: true = active, false = inactive',
    },
    is_part_time: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: 'Flag for part-time status: 1 = part-time, 0 = full-time, NULL = undefined',
    },

    is_job_applicant: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false, // กำหนดค่าเริ่มต้นเป็น false (ถือว่าเป็น manual add โดยปกติ)
      comment: 'Flag indicating if user came from job application: 1 = Yes, 0 = Manual add',
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID of the creator who created this record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID of the last updater who updated this record',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the employment record was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the employment record was last updated',
    },
  },
  {
    sequelize,
    tableName: 'user_employments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for linking users and facilities',
  }
);

UserEmploymentModel.belongsTo(DepartmentModel, { as: "department", foreignKey: "department_id", targetKey: "id" });
DepartmentModel.belongsTo(DepartmentTypeModel, { as: "department_type", foreignKey: "type_id", targetKey: "id" });
UserEmploymentModel.belongsTo(FacilityModel, { as: "facility", foreignKey: "facility_id", targetKey: "id" });
FacilityModel.belongsTo(FacilityTypeModel, { as: "facility_type", foreignKey: "type_id", targetKey: "id" });

export default UserEmploymentModel;