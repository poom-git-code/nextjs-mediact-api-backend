import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import CreditModel from './CreditsModel';
import AdsModel from './AdsModel';
import AdClickModel from './AdClicksModels';
import AdImpressionModel from './AdImpressionsModel';

export class CreditLogModel extends Model {
    public id!: number;
    public credit_id!: number;
    public reference_id!: number | null;
    public change!: number;
    public type!: string;
    public description!: string | null;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public credit?: CreditModel;
    // public ad_click?: AdClickModel;
    // public ad_impression?: AdImpressionModel;

    public static associations: {
        credit: Association<CreditLogModel, CreditModel>;
        // ad_click: Association<CreditLogModel, AdClickModel>;
        // ad_impression: Association<CreditLogModel, AdImpressionModel>;
    };
}

CreditLogModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Primary key',
        },
        credit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to credit record',
        },
        reference_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to transaction record',
        },
        change: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true,
            defaultValue: 0.0000,
            comment: 'Positive = top-up, Negative = deduction',
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'click, impression, refund, topup',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional context',
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
            allowNull: true,
            comment: 'Timestamp when the credit record was created',
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp when the credit record was last updated',
        },
    },
    {
        sequelize,
        tableName: 'credit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        comment: 'Logs for credit changes (clicks, impressions, refunds, topups)',
    }
);

// association
// CreditLogModel.belongsTo(CreditModel, {
//     foreignKey: 'credit_id',
//     as: 'credit',
//     targetKey: 'id',
// });

// CreditLogModel.belongsTo(AdsModel, {
//     foreignKey: 'ad_id',
//     as: 'ad',
//     targetKey: 'id',
// });

// CreditLogModel.belongsTo(AdClickModel, {
//     foreignKey: 'ad_click_id',
//     as: 'ad_click',
//     targetKey: 'id',
// });

// CreditLogModel.belongsTo(AdImpressionModel, {
//     foreignKey: 'ad_impression_id',
//     as: 'ad_impression',
//     targetKey: 'id',
// });


export default CreditLogModel;
