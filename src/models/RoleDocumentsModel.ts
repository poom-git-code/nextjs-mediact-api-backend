import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface RoleDocumentAttributes {
  role_id: number;
  document_sub_type_id: number;
}

interface RoleDocumentCreationAttributes extends RoleDocumentAttributes {}

class RoleDocumentModel extends Model<RoleDocumentAttributes, RoleDocumentCreationAttributes> implements RoleDocumentAttributes {
  public role_id!: number;
  public document_sub_type_id!: number;

  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

RoleDocumentModel.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: 'Reference to the role that requires this document sub type',
    },
    document_sub_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: 'Reference to the document sub type required for this role',
    },
  },
  {
    sequelize,
    tableName: 'role_documents',
    modelName: 'RoleDocument',
    timestamps: false,
    comment: 'Junction table linking roles with required document sub types',
  }
);

export default RoleDocumentModel;
export { RoleDocumentAttributes, RoleDocumentCreationAttributes };
