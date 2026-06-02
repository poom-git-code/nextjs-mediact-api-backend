import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import AdPartnerModel from './AdPartnerModel';

export class PartnerReferenceFile extends Model {
    public id!: number;
    public partner_id!: number;
    public file_name!: string;
    public file_url!: string;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public partner?: AdPartnerModel;

    public static associations: {
        partner: Association<PartnerReferenceFile, AdPartnerModel>;
    };
}

PartnerReferenceFile.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        partner_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'ID of the ad partner',
        },
        file_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'URL or path to the reference file',
        },
        file_url: {
            type: DataTypes.STRING(1024),
            allowNull: false,
            comment: 'URL or path to the reference file',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Type status: true = active, false = inactive',
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
        modelName: 'PartnerReferenceFile',
        tableName: 'partner_reference_files',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

// Association
PartnerReferenceFile.belongsTo(AdPartnerModel, {
    as: "partner",
    foreignKey: "partner_id",
    targetKey: "id",
});

export default PartnerReferenceFile;
