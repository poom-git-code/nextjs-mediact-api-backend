import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class AdsTargetGroupModel extends Model {
  public id!: number;
  public ad_id!: number;
  public target_group!: string;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

AdsTargetGroupModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the target group record',
    },
    ad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Advertisement ID associated with the target group',
    },
    target_group: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name of the target group (e.g., managers, employees)',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who added the target group',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last updated the target group',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the target group was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the target group was last updated',
    },
  },
  {
    sequelize,
    tableName: 'ads_target_groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for managing advertisement target groups',
  }
);

export default AdsTargetGroupModel;