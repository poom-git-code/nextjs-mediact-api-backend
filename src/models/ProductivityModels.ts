import { Association, DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import ProductivityLogModel from "./ProductivityLogModel";
import { DepartmentModel } from "./DepartmentModel";

export interface ProductivityRecordAttributes {
  id: number;
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
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductivityRecordCreationAttributes
  extends Optional<ProductivityRecordAttributes, 'id' | 'total_patients_calculated' | 'free_beds_calculated' | 'productivity_score' | 'created_at' | 'updated_at'> { }

class ProductivityRecordModel
  extends Model<ProductivityRecordAttributes, ProductivityRecordCreationAttributes>
  implements ProductivityRecordAttributes {

  public id!: number;
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
  public created_by?: number | null;
  public updated_by?: number | null;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;

  public readonly department?: DepartmentModel;

  public static associations: {
    department: Association<ProductivityRecordModel, DepartmentModel>;
  };
}

ProductivityRecordModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary Key: ID ของข้อมูลยอดเวร'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK: ID ของแผนก',
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    shift_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'วันที่ของเวร'
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK: ID ประเภทเวร (เช่น เช้า, บ่าย, ดึก)',
      references: {
        model: 'shift_types',
        key: 'id'
      }
    },
    total_beds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนเตียงทั้งหมด'
    },
    critical_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยวิกฤต (Critical)'
    },
    severe_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยหนัก (Severe)'
    },
    semi_critical_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยกึ่งวิกฤต (Semi Critical)'
    },
    moderate_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยปานกลาง (Moderate)'
    },
    convalescing_patients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยระยะฟื้นฟู (Convalescing)'
    },
    admitted_patients: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยรับใหม่ (Admit)'
    },
    discharged_patients: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'จำนวนผู้ป่วยจำหน่าย (Discharge)'
    },
    total_patients_calculated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'จำนวนผู้ป่วยรวม '
    },
    free_beds_calculated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'จำนวนเตียงว่าง '
    },
    bed_occupancy_rate: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'อัตราการครองเตียง (%) คำนวณจาก (total_patients_calculated / total_beds) * 100'
    },
    productivity_score: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'คะแนนประสิทธิภาพ % '
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK: ID ของผู้สร้างข้อมูล',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK: ID ของผู้แก้ไขข้อมูลล่าสุด',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'productivity_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'ตารางข้อมูลยอดเวรของแต่ละแผนก',
    indexes: [
      {
        unique: true,
        name: 'unique_department_shift_date_type',
        fields: ['department_id', 'shift_date', 'shift_type_id']
      },
      {
        name: 'idx_department_id',
        fields: ['department_id']
      },
      {
        name: 'idx_shift_date',
        fields: ['shift_date']
      },
      {
        name: 'idx_shift_type_id',
        fields: ['shift_type_id']
      },
      {
        name: 'idx_department_shift_date',
        fields: ['department_id', 'shift_date']
      }
    ]
  }
);

// After create hook for audit logging
ProductivityRecordModel.addHook('afterCreate', async (record: ProductivityRecordModel, options: any) => {
  try {
    await ProductivityLogModel.createFromRecord(record, 'CREATE', options.userId);
  } catch (error) {
    console.error('Error creating audit log on create:', error);
  }
});

// After update hook for audit logging
ProductivityRecordModel.addHook('afterUpdate', async (record: ProductivityRecordModel, options: any) => {
  try {
    await ProductivityLogModel.createFromRecord(record, 'UPDATE', options.userId);
  } catch (error) {
    console.error('Error creating audit log on update:', error);
  }
});

// After destroy hook for audit logging
ProductivityRecordModel.addHook('afterDestroy', async (record: ProductivityRecordModel, options: any) => {
  try {
    await ProductivityLogModel.createFromRecord(record, 'DELETE', options.userId);
  } catch (error) {
    console.error('Error creating audit log on delete:', error);
  }
});

export default ProductivityRecordModel;
