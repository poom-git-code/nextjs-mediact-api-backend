import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";


export interface ProductivityLogAttributes {
  id: number;
  record_id: number;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  action_by?: number | null;
  action_at: Date;
  department_id: number;
  shift_date: Date;
  shift_type_id: number;
  total_beds: number;
  critical_patients: number;
  severe_patients: number;
  semi_critical_patients: number;
  moderate_patients: number;
  convalescing_patients: number;
  admitted_patients: number;
  discharged_patients: number;
  total_patients_calculated?: number | null;
  free_beds_calculated?: number | null;
  bed_occupancy_rate?: number | null;
  productivity_score?: number | null;
}

export interface ProductivityLogCreationAttributes 
  extends Optional<ProductivityLogAttributes, 'id' | 'action_at'> {}

class ProductivityLogModel 
  extends Model<ProductivityLogAttributes, ProductivityLogCreationAttributes> 
  implements ProductivityLogAttributes {
  
  public id!: number;
  public record_id!: number;
  public action_type!: 'CREATE' | 'UPDATE' | 'DELETE';
  public action_by?: number | null;
  public action_at!: Date;
  public department_id!: number;
  public shift_date!: Date;
  public shift_type_id!: number;
  public total_beds!: number;
  public critical_patients!: number;
  public severe_patients!: number;
  public semi_critical_patients!: number;
  public moderate_patients!: number;
  public convalescing_patients!: number;
  public admitted_patients!: number;
  public discharged_patients!: number;
  public total_patients_calculated?: number | null;
  public free_beds_calculated?: number | null;
  public bed_occupancy_rate?: number | null;
  public productivity_score?: number | null;

  public static async createFromRecord(
    record: any, 
    actionType: 'CREATE' | 'UPDATE' | 'DELETE', 
    actionBy?: number
  ): Promise<ProductivityLogModel> {
    return await ProductivityLogModel.create({
      record_id: record.id,
      action_type: actionType,
      action_by: actionBy,
      department_id: record.department_id,
      shift_date: record.shift_date,
      shift_type_id: record.shift_type_id,
      total_beds: record.total_beds,
      critical_patients: record.critical_patients,
      severe_patients: record.severe_patients,
      semi_critical_patients: record.semi_critical_patients,
      moderate_patients: record.moderate_patients,
      convalescing_patients: record.convalescing_patients,
      admitted_patients: record.admitted_patients,
      discharged_patients: record.discharged_patients,
      total_patients_calculated: record.total_patients_calculated,
      free_beds_calculated: record.free_beds_calculated,
      bed_occupancy_rate: record.bed_occupancy_rate,
      productivity_score: record.productivity_score
    });
  }
}

ProductivityLogModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary Key: ID ของ log'
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK: ID ของข้อมูลจากตาราง productivity_records',
      references: {
        model: 'productivity_records',
        key: 'id'
      }
    },
    action_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['CREATE', 'UPDATE', 'DELETE']]
      },
      comment: 'ประเภทของการกระทำ (เช่น CREATE, UPDATE)'
    },
    action_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK: user_id ของผู้ที่ทำให้เกิดการเปลี่ยนแปลง',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'เวลาที่เกิดการเปลี่ยนแปลง'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ข้อมูล ณ เวลาที่บันทึก: ID ของแผนก'
    },
    shift_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'ข้อมูล ณ เวลาที่บันทึก: วันที่ของเวร'
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ข้อมูล ณ เวลาที่บันทึก: ID ประเภทเวร'
    },
    total_beds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    critical_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    severe_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    semi_critical_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    moderate_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    convalescing_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    admitted_patients: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    discharged_patients: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    total_patients_calculated: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    free_beds_calculated: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bed_occupancy_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    productivity_score: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'productivity_records_logs',
    timestamps: false, 
    comment: 'ตารางเก็บประวัติการเปลี่ยนแปลงข้อมูลยอดเวร (Audit Log)',
    indexes: [
      {
        name: 'idx_record_id',
        fields: ['record_id']
      },
      {
        name: 'idx_action_by',
        fields: ['action_by']
      },
      {
        name: 'idx_action_type',
        fields: ['action_type']
      },
      {
        name: 'idx_action_at',
        fields: ['action_at']
      },
      {
        name: 'idx_department_action_at',
        fields: ['department_id', 'action_at']
      }
    ]
  }
);

export default ProductivityLogModel;