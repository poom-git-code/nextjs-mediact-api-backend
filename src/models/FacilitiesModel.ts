import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserEmploymentModel from './UserEmploymentsModel';

export class FacilityModel extends Model {
  public id!: number;
  public name!: string;
  public type_id!: number;
  public latitude!: number | null;
  public longitude!: number | null;
  public address!: string | null;

  // --- ส่วนที่เพิ่มเข้ามา ---
  public country_code!: string | null;
  public country_name_th!: string | null;
  public country_name_en!: string | null;
  public province_code!: number | null;
  public province_name_th!: string | null;
  public province_name_en!: string | null;
  public district_code!: number | null;
  public district_name_th!: string | null;
  public district_name_en!: string | null;
  public subdistrict_code!: number | null;
  public subdistrict_name_th!: string | null;
  public subdistrict_name_en!: string | null;
  public postal_code!: string | null;
  // -------------------------

  public abbreviation!: string | null;
  public full_schedule!: boolean | null;
  public mediact_match!: boolean | null;

  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

FacilityModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each facility',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name of the facility',
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the type of facility (e.g., Hospital, Clinic)',
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
      comment: 'Latitude of the facility location',
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
      comment: 'Longitude of the facility location',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Physical address of the facility',
    },

    // --- ส่วนที่เพิ่มเข้ามา ---
    country_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Country code',
    },
    country_name_th: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Country name in Thai',
    },
    country_name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Country name in English',
    },
    province_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Province code',
    },
    province_name_th: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Province name in Thai',
    },
    province_name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Province name in English',
    },
    district_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'District code',
    },
    district_name_th: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'District name in Thai',
    },
    district_name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'District name in English',
    },
    subdistrict_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Subdistrict code',
    },
    subdistrict_name_th: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Subdistrict name in Thai',
    },
    subdistrict_name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Subdistrict name in English',
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Postal code',
    },
    // -------------------------

    abbreviation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ตัวย่อของสถานพยาบาล เช่น PYT2, BDMS',
    },

    full_schedule: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: 'flag เพื่อใช้บอกสถานะความสามารถในการใช้งานฟังชั่นฝั่ง app&web ทั้งหมด',
    },

    mediact_match: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      comment: 'flag เพื่อใช้บอกสถานะความสามารถในการใช้งานฟังชั่นฝั่ง app&web เฉพาะ MediAct Match',
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Facility status: true = active, false = inactive',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID of the creator who created this record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID of the last updater who updated this record',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the facility record was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the facility record was last updated',
    },
  },
  {
    sequelize,
    tableName: 'facilities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for facility information',
  }
);

// FacilityModel.hasMany(UserEmploymentModel, { as: "user_employments", foreignKey: "facility_id" });

export default FacilityModel;