import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import AdsModel from './AdsModel';
import CreditLogModel from './CreditLogsModel';
import AdMediaModel from './AdMediaModel';

export class AdClickModel extends Model {
    public id!: number;
    public ad_id!: number;
    public ad_media_id!: number | null;
    public timestamp!: Date;
    public viewer_ip!: string | null;
    public viewer_user_id!: number | null;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public ad?: AdsModel;
    public ad_media?: AdMediaModel;

    public static associations: {
        ad: Association<AdClickModel, AdsModel>;
        ad_media: Association<AdClickModel, AdMediaModel>;
    };
}

AdClickModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: 'Unique identifier for the click',
        },
        ad_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'ID of the advertisement',
        },
        ad_media_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the specific media (image/video) shown to the user',
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the click occurred',
        },
        viewer_ip: {
            type: DataTypes.STRING(45),
            allowNull: true,
            comment: 'IP address of the viewer',
        },
        viewer_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the viewer (if logged in)',
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the user who created the record',
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the user who last updated the record',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the record was created',
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the record was last updated',
        },
    },
    {
        sequelize,
        tableName: 'ad_clicks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        comment: 'Stores ad click events',
    }
);

// AdClickModel.belongsTo(AdsModel, {
//     foreignKey: 'ad_id',
//     as: 'ad',
//     targetKey: 'id',
// });

// AdClickModel.hasMany(CreditLogModel, {
//     foreignKey: 'ad_click_id',
//     as: 'credit_log',
//     sourceKey: 'id',
// });

AdClickModel.belongsTo(AdMediaModel, {
    foreignKey: 'ad_media_id',
    as: 'ad_media',
    targetKey: 'id',
});

export default AdClickModel;
