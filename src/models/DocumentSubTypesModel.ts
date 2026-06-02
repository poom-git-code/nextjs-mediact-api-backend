import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DocumentSubTypeAttributes {
  id: number;
  sub_type_code: string;
  sub_type_name: string;
  description?: string;
  is_active: boolean;
}

interface DocumentSubTypeCreationAttributes extends Optional<DocumentSubTypeAttributes, 'id' | 'description' | 'is_active'> {}

class DocumentSubTypeModel extends Model<DocumentSubTypeAttributes, DocumentSubTypeCreationAttributes> implements DocumentSubTypeAttributes {
  public id!: number;
  public sub_type_code!: string;
  public sub_type_name!: string;
  public description?: string;
  public is_active!: boolean;

  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

DocumentSubTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key for document sub types',
    },
    sub_type_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'รหัสสำหรับอ้างอิงในโปรแกรม เช่น MEDICAL_LICENSE, SPECIALIST_CERT',
    },
    sub_type_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'ชื่อประเภทย่อยเอกสารสำหรับแสดงผล เช่น ใบอนุญาตประกอบวิชาชีพเวชกรรม',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'คำอธิบายเพิ่มเติม',
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: 'สถานะการใช้งานประเภทย่อยเอกสารนี้',
    },
  },
  {
    sequelize,
    tableName: 'document_sub_types',
    modelName: 'DocumentSubType',
    timestamps: false,
    comment: 'ตารางเก็บประเภทย่อยเอกสารที่ระบบรองรับ',
  }
);

export default DocumentSubTypeModel;
export { DocumentSubTypeAttributes, DocumentSubTypeCreationAttributes };
