import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DocumentTypeAttributes {
  id: number;
  type_code: string;
  type_name: string;
  description?: string;
  is_active: boolean;
}

interface DocumentTypeCreationAttributes extends Optional<DocumentTypeAttributes, 'id' | 'description' | 'is_active'> {}

class DocumentTypeModel extends Model<DocumentTypeAttributes, DocumentTypeCreationAttributes> implements DocumentTypeAttributes {
  public id!: number;
  public type_code!: string;
  public type_name!: string;
  public description?: string;
  public is_active!: boolean;

  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

DocumentTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key for document types',
    },
    type_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'รหัสสำหรับอ้างอิงในโปรแกรม เช่น ID_CARD, PASSPORT',
    },
    type_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'ชื่อประเภทเอกสารสำหรับแสดงผล เช่น บัตรประจำตัวประชาชน',
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
      comment: 'สถานะการใช้งานประเภทเอกสารนี้',
    },
  },
  {
    sequelize,
    tableName: 'document_types',
    modelName: 'DocumentType',
    timestamps: false,
    comment: 'ตารางเก็บประเภทเอกสารที่ระบบรองรับ',
  }
);

export default DocumentTypeModel;
export { DocumentTypeAttributes, DocumentTypeCreationAttributes };