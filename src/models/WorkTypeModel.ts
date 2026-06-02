import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class WorkTypeModel extends Model {
	public id!: number;
	public name!: string;
	public description!: string | null;
}

WorkTypeModel.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			comment: "Primary Key: Unique ID for each work type",
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
			comment: "e.g., Onsite, Online, OT, On-Call",
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			comment: "Optional description for the work type",
		},
	},
	{
		sequelize,
		tableName: "work_types",
		timestamps: false,
		comment: "Table for different types of work (Onsite, Online, OT, etc.)",
		indexes: [
			{
				name: "work_types_name_unique",
				unique: true,
				fields: ["name"],
			},
		],
	}
);


export default WorkTypeModel;
