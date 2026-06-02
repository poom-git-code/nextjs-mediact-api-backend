import { DataTypes, Model, Association } from 'sequelize';
import { sequelize } from '../config/database';
import AdPartnerModel from './AdPartnerModel';
import AdTypeModel from './AdTypeModel';
import CreditLogModel from './CreditLogsModel';
import AdClickModel from './AdClicksModels';
import AdTargetModel from './AdTargetsModel';
import AdImpressionModel from './AdImpressionsModel';
// import AdMediaModel from './AdMediaModel';

export class AdsModel extends Model {
  public id!: number;
  public partner_id!: number;
  public ad_type_id!: number;
  public url!: string | null;
  public start_date!: Date | null;
  public end_date!: Date | null;
  public title!: string;
  public content!: string | null;
  public status!: string;
  public budget!: number;
  public used_budgets!: number;
  public cost_per_click!: number | null;
  public cost_per_impression!: number | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public partner?: AdPartnerModel;
  public ad_type?: AdTypeModel;

  public static associations: {
    partner: Association<AdsModel, AdPartnerModel>;
    ad_type: Association<AdsModel, AdTypeModel>;
  };
}

AdsModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the advertisement',
    },
    partner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID who created the advertisement',
    },
    ad_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Type of Ads',
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL for the ads source or reference',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Start date of the advertisement',
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'End date of the advertisement',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Title of the advertisement',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Content or description of the advertisement',
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active',
      comment: 'Status of the advertisement (e.g., active, paused, ended)',
    },
    budget: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0.0000,
      comment: 'Budget allocated for the advertisement',
    },
    used_budgets: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0.0000,
      comment: 'Used Budget of the advertisement',
    },
    cost_per_click: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0.0000,
      comment: 'Cost per click for the advertisement',
    },
    cost_per_impression: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0.0000,
      comment: 'Cost per impression for the advertisement',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who created the advertisement',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last updated the advertisement',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the advertisement was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the advertisement was last updated',
    },
  },
  {
    sequelize,
    tableName: 'ads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing advertisements',
  }
);

// Associations
AdsModel.belongsTo(AdPartnerModel, {
  foreignKey: 'partner_id',
  as: 'partner',
  targetKey: 'id'
});

AdsModel.belongsTo(AdTypeModel, {
  foreignKey: 'ad_type_id',
  as: 'ad_type',
  targetKey: 'id'
});

AdsModel.hasMany(AdClickModel, {
  foreignKey: 'ad_id',
  as: 'ad_click',
  sourceKey: 'id',
});

AdsModel.hasMany(AdImpressionModel, {
  foreignKey: 'ad_id',
  as: 'ad_impression',
  sourceKey: 'id',
});

AdsModel.hasMany(AdTargetModel, {
  foreignKey: 'ad_id',
  as: 'ad_target',
  sourceKey: 'id',
});

// AdsModel.hasMany(AdMediaModel, {
//   foreignKey: 'ad_id',
//   as: 'ad_media',
//   sourceKey: 'id',
// });

export default AdsModel;
