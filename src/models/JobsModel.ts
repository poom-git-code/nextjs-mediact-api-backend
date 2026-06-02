import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import JobStatusModel from './JobStatusModel';
import DepartmentModel from './DepartmentModel';
import RoleModel from './RolesModel';
import JobApplyModel from "./JobApplyModel";

export class JobModel extends Model {
  public id!: number;
  public source_schedule_id!: number | null;
  public job_title!: string;
  public job_description!: string | null;
  public work_date!: Date;
  public start_time!: string;
  public end_time!: string;
  public required_role_id!: number | null;
  public required_department_id!: number | null;
  public publish_group!: 'hospital' | 'part-time' | 'system';
  public is_public!: boolean;
  public status_id!: number;
  public max_applicants!: number | null;
  public application_deadline!: Date | null;
  public job_fee!: string | null;
  public job_fee_vat_included!: boolean;
  public auto_close_type!: 'time' | 'first_applicant' | 'max_applicants' | 'manual';
  public experience_range!: string | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public job_applies?: JobApplyModel[];
}

JobModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    source_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    job_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    job_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    work_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    required_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    required_department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    publish_group: {
      type: DataTypes.ENUM('hospital', 'part-time', 'system'),
      allowNull: false,
      defaultValue: 'hospital',
      comment: 'Audience group selected in the UI',
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    max_applicants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of applicants allowed for the job',
      defaultValue: null,
    },
    application_deadline: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Datetime when job application closes automatically',
    },
    job_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Total fee paid for the job (inclusive or exclusive of VAT)',
    },
    job_fee_vat_included: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '1 = job_fee includes VAT, 0 = excludes VAT',
    },
    auto_close_type: {
      type: DataTypes.ENUM('time', 'first_applicant', 'max_applicants', 'manual'),
      defaultValue: 'time',
      comment: 'How the job closes: by time, first applicant, max applicants, or manual',
    },

    experience_range: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Range of work experience in years',
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for job postings (auto or manual)',
  }
);

// Associations
JobModel.belongsTo(JobStatusModel, { as: "job_status", foreignKey: "status_id" });
JobModel.belongsTo(DepartmentModel, { as: "department", foreignKey: "required_department_id" });
JobModel.belongsTo(RoleModel, { as: "role", foreignKey: "required_role_id" });

export default JobModel;
