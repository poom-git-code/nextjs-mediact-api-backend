import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';
import DocumentTypeModel from './DocumentTypeModel';
import DocumentSubTypesModel from './DocumentSubTypesModel';

interface UserDocumentAttributes {
  id: number;
  user_id: number;
  document_type_id: number;
  document_sub_type_id?: number;
  file_url: string;
  document_number?: string;
  issue_date?: Date;
  expiry_date?: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  uploaded_at: Date;
  verified_at?: Date;
  is_deleted: boolean;
}

interface UserDocumentCreationAttributes extends Optional<UserDocumentAttributes, 'id' | 'document_sub_type_id' | 'document_number' | 'issue_date' | 'expiry_date' | 'rejection_reason' | 'uploaded_at' | 'verified_at' | 'is_deleted'> {}

class UserDocumentModel extends Model<UserDocumentAttributes, UserDocumentCreationAttributes> implements UserDocumentAttributes {
  public id!: number;
  public user_id!: number;
  public document_type_id!: number;
  public document_sub_type_id?: number;
  public file_url!: string;
  public document_number?: string;
  public issue_date?: Date;
  public expiry_date?: Date;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  public rejection_reason?: string;
  public uploaded_at!: Date;
  public verified_at?: Date;
  public is_deleted!: boolean;

  
  public user?: UserModel;
  public documentType?: DocumentTypeModel;
  public documentSubType?: DocumentSubTypesModel;
  
  // New alias for user association
  public document_owner?: UserModel;

  
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}


UserDocumentModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key for user documents',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK อ้างอิงถึงตาราง users',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK อ้างอิงถึงตาราง document_types',
      references: {
        model: 'document_types',
        key: 'id',
      },
    },
    document_sub_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK อ้างอิงถึงตาราง document_sub_types',
      references: {
        model: 'document_sub_types',
        key: 'id',
      },
    },
    file_url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      comment: 'URL หรือ Path ของไฟล์เอกสารที่อัปโหลด',
    },
    document_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'เลขที่เอกสาร เช่น เลขบัตรประชาชน',
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'วันที่ออกเอกสาร',
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'วันที่เอกสารหมดอายุ',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: 'สถานะการตรวจสอบเอกสาร',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'เหตุผลในกรณีที่เอกสารถูกปฏิเสธ',
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'วันที่อัปโหลดเอกสาร',
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'วันที่ตรวจสอบเอกสาร',
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: 'สถานะการลบเอกสาร: 0 = ไม่ถูกลบ, 1 = ถูกลบ',
    },
  },
  {
    sequelize,
    tableName: 'user_documents',
    modelName: 'UserDocument',
    timestamps: false, 
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_document_type_id',
        fields: ['document_type_id'],
      },
      {
        name: 'fk_userdocs_to_sub_types',
        fields: ['document_sub_type_id'],
      },
    ],
    comment: 'ตารางเก็บข้อมูลเอกสารที่ผู้ใช้อัปโหลด',
  }
);

export default UserDocumentModel;
export { UserDocumentAttributes, UserDocumentCreationAttributes };
