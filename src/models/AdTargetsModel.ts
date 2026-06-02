import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import AdsModel from './AdsModel';

export class AdTargetModel extends Model {
    public id!: number;
    public ad_id!: number;
    public target_type!: string | null;
    public target_value!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public ad?: AdsModel;

    public static associations: {
        ad: Association<AdTargetModel, AdsModel>;
    };
}

AdTargetModel.init(
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
        target_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        target_value: {
            type: DataTypes.STRING(255),
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
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'ad_targets',
        timestamps: false,
        modelName: 'AdTarget',
        underscored: true,
    }
);

// AdTargetModel.belongsTo(AdsModel, {
//     foreignKey: 'ad_id',
//     as: 'ad',
//     targetKey: 'id',
// });

export default AdTargetModel;
