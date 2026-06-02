import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';
import type DepartmentModel from './DepartmentModel';
import type CertificationModel from './CertificationModel';

export class DepartmentCertificationModel extends Model {
    public id!: number;
    public department_id!: number;
    public certification_id!: number;
    public created_by!: number | null;
    public created_at!: Date;

    public department?: DepartmentModel;
    public certification?: CertificationModel;
    public created_by_user?: UserModel;
}

DepartmentCertificationModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Primary Key: Unique ID for the link',
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to the departments table (Foreign Key)',
            references: {
                model: 'departments',
                key: 'id',
            },
        },
        certification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to the certifications table (Foreign Key)',
            references: {
                model: 'certifications',
                key: 'id',
            },
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'User ID of the creator who created this link',
            references: {
                model: 'users',
                key: 'id',
            },
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: 'Timestamp when the link was created',
        },
    },
    {
        sequelize,
        tableName: 'department_certifications',
        timestamps: true,
        updatedAt: false,
        createdAt: 'created_at',
        comment: 'Junction table linking departments to certifications (M:N)',
        indexes: [
            {
                unique: true,
                name: 'uq_dept_cert',
                fields: ['department_id', 'certification_id'],
            },
        ],
    }
);

// DepartmentCertificationModel.belongsTo(DepartmentModel, {
//     as: 'department',
//     foreignKey: 'department_id',
// });

// DepartmentCertificationModel.belongsTo(CertificationModel, {
//     as: 'certification',
//     foreignKey: 'certification_id',
// });

// DepartmentCertificationModel.belongsTo(UserModel, {
//     as: 'created_by_user',
//     foreignKey: 'created_by',
// });

export default DepartmentCertificationModel;