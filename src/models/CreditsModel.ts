import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import AdPartnerModel from './AdPartnerModel';
import CreditLogModel from './CreditLogsModel';

export class CreditModel extends Model {
  public id!: number;
  public user_id!: number;
  public total_credits!: number;
  public used_credits!: number;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Virtual field
  public get remaining_credits(): number {
    return this.total_credits - this.used_credits;
  }

  public partner?: AdPartnerModel;

  public static associations: {
    partner: Association<CreditModel, AdPartnerModel>;
  };
}

CreditModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the credit record',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'User ID who purchased the credits',
    },
    total_credits: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0.0000,
      comment: 'Total credits purchased by the user',
    },
    used_credits: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0.0000,
      comment: 'Credits already used by the user',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the admin or system that created the record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the admin or system that last updated the record',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      comment: 'Timestamp when the credit record was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      comment: 'Timestamp when the credit record was last updated',
    },
  },
  {
    sequelize,
    tableName: 'credits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for managing user credits',
  }
);

// Associations
CreditModel.belongsTo(AdPartnerModel, {
  foreignKey: 'user_id',
  as: 'partner',
  targetKey: "id"
});

CreditModel.hasMany(CreditLogModel, {
    foreignKey: 'credit_id',
    as: 'credit_log',
    sourceKey: 'id',
});

export default CreditModel;
