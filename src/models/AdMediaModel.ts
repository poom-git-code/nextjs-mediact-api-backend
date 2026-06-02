import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import AdsModel from './AdsModel';

export class AdMediaModel extends Model {
    public id!: number;
    public ad_id!: number;
    public media_name!: string | null;
    public media_url!: string | null;
    public media_type!: string | null;
    public media_size!: number | null;
    public thumbnail_url!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public ad?: AdsModel;

    public static associations: {
        ad: Association<AdMediaModel, AdsModel>;
    };
}

AdMediaModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        ad_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        media_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        media_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        media_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        media_size: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        thumbnail_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Type status: true = active, false = inactive",
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'ad_media',
        timestamps: false,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

// AdMediaModel.belongsTo(AdsModel, {
//     foreignKey: 'ad_id',
//     as: 'ad',
//     targetKey: 'id',
// });

export default AdMediaModel;
