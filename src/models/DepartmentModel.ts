import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';
import FacilityModel from './FacilitiesModel';
import DepartmentTypeModel from './DepartmentTypesModel';

// Type-only imports to avoid circular dependencies
import type { DepartmentOperatingHoursModel } from './DepartmentOperatingHoursModel';
import type { DepartmentSupervisorModel } from './DepartmentSupervisorModel';
import type { ShiftTypeModel } from './ShiftTypesModel';
import type { UserEmploymentModel } from './UserEmploymentsModel';
import DepartMentCategoryModel from './DepartMentCategoryModel';

import CertificationModel from './CertificationModel';
import DepartmentCertificationModel from './DepartmentCertificationModel';

export class DepartmentModel extends Model {
  public id!: number;
  public name!: string;
  public abbreviation!: string | null;
  public type_id!: number;
  public facility_id!: number;
  public parent_department_id!: number | null;
  public dayoff_duedate!: number;
  public schedule_announcement_date!: number | null;
  public schedule_announcement_time!: string | null; // Sequelize handles TIME as string
  public day_off_submission_start_date!: number | null;
  public day_off_submission_start_time!: string | null;
  public day_off_submission_end_date!: number | null;
  public day_off_submission_end_time!: string | null;
  public include_weekend!: boolean;
  public include_holiday!: boolean;
  public role_tags!: string | null;
  public is_default!: boolean;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Optional properties for associations
  public created_by_user?: UserModel; // เพิ่ม property สำหรับ created_by_user
  public updated_by_user?: UserModel; // เพิ่ม property สำหรับ updated_by_user
  public type?: DepartmentTypeModel;
  public facility?: FacilityModel;
  public parent_department?: DepartmentModel;

  // Related model associations with proper types
  public department_operating_hours?: DepartmentOperatingHoursModel[];
  public department_supervisors?: DepartmentSupervisorModel[];
  public shift_types?: ShiftTypeModel[];

  public department_categories?: DepartMentCategoryModel[];
  public department_certifications?: DepartmentCertificationModel[];

  public certifications?: CertificationModel[];
}

DepartmentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each department',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name of the department',
    },
    abbreviation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Abbreviation or short name of the department',
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the type of department',
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the facility this department belongs to',
    },
    parent_department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reference to the parent department if applicable',
    },
    dayoff_duedate: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Number of days in advance required for day-off request deadline',
    },
    schedule_announcement_date: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Date when schedule should be announced',
    },
    schedule_announcement_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Time for schedule announcement (HH:MM format)',
    },
    day_off_submission_start_date: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of days in advance for day off submission start',
    },
    day_off_submission_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Start time for day off submission (HH:MM format)',
    },
    day_off_submission_end_date: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of days in advance for day off submission end',
    },
    day_off_submission_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'End time for day off submission (HH:MM format)',
    },
    include_weekend: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Indicates whether weekends are included in the department schedule (1 = yes, 0 = no)',
    },
    include_holiday: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Indicates whether holidays are included in the department schedule (1 = yes, 0 = no)',
    },
    role_tags: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Comma-separated list of role tags (optional)'
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this department is a default system-generated department',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Department status: true = active, false = inactive',
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
      comment: 'Timestamp when the department record was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the department record was last updated',
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for department information',
  }
);

// DepartmentModel.belongsTo(FacilityModel, { as: "facility", foreignKey: "facility_id" });
// DepartmentModel.belongsTo(DepartmentTypeModel, { as: "type", foreignKey: "type_id" });
// DepartmentModel.belongsTo(DepartmentModel, { as: "parent_department", foreignKey: "parent_department_id" });

// DepartmentModel.hasMany(DepartMentCategoryModel, {
//   foreignKey: 'department_id',
//   as: 'department_categories'
// });

// DepartmentModel.belongsToMany(CertificationModel, {
//   through: DepartmentCertificationModel,
//   foreignKey: 'department_id',      
//   otherKey: 'certification_id',     
//   as: 'certifications',             
// });

export default DepartmentModel;