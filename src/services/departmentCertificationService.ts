import DepartmentModel from "../models/DepartmentModel";
import CertificationModel from "../models/CertificationModel";
import DepartmentCertificationModel from "../models/DepartmentCertificationModel";

/**
 * ดึง Certifications ทั้งหมดที่ผูกกับ Department ID ที่ระบุ
 * @param department_id - ID ของ Department
 */
export const getCertificationsForDepartment = async (department_id: number) => {
  const department = await DepartmentModel.findByPk(department_id, {
    include: [
      {
        model: CertificationModel,
        as: "certifications", // 'certifications' มาจาก 'as' ใน associations.ts
        through: { attributes: [] }, // ไม่ต้องแสดงข้อมูลจาก junction table
        required: false,
      },
    ],
    attributes: ["id", "name"], // เอาแค่ id, name ของ department ก็พอ
  });

  if (!department) {
    throw new Error("Department not found");
  }

  // คืนค่า array ของ certifications ที่ผูกอยู่
  return department.certifications || [];
};

/**
 * ผูก Certification เข้ากับ Department
 * @param department_id - ID ของ Department
 * @param certification_id - ID ของ Certification
 * @param created_by - ID ของ user ที่ทำการผูก
 */
export const addCertificationToDepartment = async (
  department_id: number,
  certification_id: number,
  created_by: number
) => {
  // ใช้ findOrCreate เพื่อป้องกันการสร้างข้อมูลซ้ำ (มี unique constraint 'uq_dept_cert' ที่ DB)
  const [link, created] = await DepartmentCertificationModel.findOrCreate({
    where: { department_id, certification_id },
    defaults: { created_by },
  });

  if (!created) {
    throw new Error("This certification is already linked to this department.");
  }

  return link;
};

/**
 * ลบการผูก Certification ออกจาก Department
 * @param department_id - ID ของ Department
 * @param certification_id - ID ของ Certification
 */
export const removeCertificationFromDepartment = async (
  department_id: number,
  certification_id: number
) => {
  const link = await DepartmentCertificationModel.findOne({
    where: { department_id, certification_id },
  });

  if (!link) {
    throw new Error("Certification link not found for this department.");
  }

  // ทำการลบ link
  await link.destroy();
  return { message: "Certification removed from department successfully." };
};
