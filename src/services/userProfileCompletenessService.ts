import UserRoleModel from "../models/UserRolesModel";
import UserModel from "../models/UserModel";
import UserProfileCompletenessModel from "../models/UserProfileCompletenessModel";
import AddressModel from "../models/AddressesModel";
import UserCertificationModel from "../models/UserCertificationModel";
import UserExperienceModel from "../models/UserExperienceModel";
import WorkAreasModel from "../models/WorkAreasModel";
import UserDocumentModel from "../models/UserDocumentModel";

export const calculateUserProfileCompleteness = async (id: number, user_id: number) => {
    // console.log(`\n========== START CALCULATION: User ID ${id} ==========`);

    // Parallel Fetch
    const [
        user,
        userRole,
        certificateCount,
        experienceCount,
        workAreas,
        documentCount,
        addressCount
    ] = await Promise.all([
        UserModel.findByPk(id),
        UserRoleModel.findOne({ where: { user_id: id, is_active: true } }),
        UserCertificationModel.count({ where: { user_id: id, is_active: true } }),
        UserExperienceModel.count({ where: { user_id: id } }),
        WorkAreasModel.findAll({ where: { user_id: id } }),
        UserDocumentModel.count({
            where: {
                user_id: id,
                document_type_id: 2,
                is_deleted: 0,
            }
        }),
        AddressModel.count({ where: { reference_id: id, is_active: true } })
    ]);

    if (!user) throw new Error("User not found");
    if (!userRole) throw new Error("User role not found");

    const roleId = userRole.role_id;
    const isPnNa = roleId === 30 || roleId === 31 || roleId === 29;

    // --- Log Initial Data ---
    // console.log("--- [1] Initial Data Loaded ---");
    // console.log(`Role ID: ${roleId} | Group: ${isPnNa ? 'PN/NA (High Exp Weight)' : 'Doctor/Nurse (Standard Weight)'}`);
    // console.log(`Counts -> Certs: ${certificateCount}, Exp: ${experienceCount}, Docs(Approved): ${documentCount}, Address: ${addressCount}`);
    // console.log(`WorkArea Found: ${!!workAreas}`);
    // -------------------------

    const hasValue = (value: any): boolean => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === "") return false;
        return true;
    };

    let totalScore = 0;
    const personalWeight = 2.5;
    const otherWeight = 2.5;

    // --- Section 1: Personal Info (15 คะแนน) ---
    // console.log("\n--- [Section 1] Personal Info (Max 15) ---");
    const p1 = hasValue(user.first_name_encrypted);
    const p2 = hasValue(user.last_name_encrypted);
    const p3 = (user.gender_id && user.gender_id !== 0);
    const p4 = (hasValue(user.date_of_birth_encrypted) || !!user.date_of_birth);
    const p5 = hasValue(user.nickname);
    const p6 = hasValue(user.ID_line_encrypted);

    if (p1) totalScore += personalWeight;
    if (p2) totalScore += personalWeight;
    if (p3) totalScore += personalWeight;
    if (p4) totalScore += personalWeight;
    if (p5) totalScore += personalWeight;
    if (p6) totalScore += personalWeight;

    // console.log(`1. First Name: ${p1}`);
    // console.log(`2. Last Name: ${p2}`);
    // console.log(`3. Gender: ${p3} (val: ${user.gender_id})`);
    // console.log(`4. DOB: ${p4}`);
    // console.log(`5. Nickname: ${p5}`);
    // console.log(`6. Line ID: ${p6}`);
    // console.log(`> Section 1 Score: ${totalScore}`);


    // --- Section 2: Role & Expertises (17.5 คะแนน) ---
    // console.log("\n--- [Section 2] Role & Expertises (Max 17.5) ---");
    let s2Score = 0;

    // Role
    if (userRole) {
        totalScore += 2.5;
        s2Score += 2.5;
        // console.log(`- Role Assigned: Yes (+2.5)`);
    } else {
        // console.log(`- Role Assigned: No (+0)`);
    }

    // Certification
    if (certificateCount > 0) {
        totalScore += 15;
        s2Score += 15;
        // console.log(`- Certificates (>0): Yes (${certificateCount}) (+15)`);
    } else {
        // console.log(`- Certificates (>0): No (+0)`);
    }
    // console.log(`> Section 2 Score: ${s2Score}`);


    // --- Section 3: Work Experience (Variable Weight) ---
    // console.log("\n--- [Section 3] Work Experience ---");
    // PN/NA = 30 คะแนน, กลุ่มอื่น = 15 คะแนน
    const experienceWeight = isPnNa ? 30 : 15;
    let s3Score = 0;

    // console.log(`- Weight Logic: ${isPnNa ? 'PN/NA (30pts)' : 'Standard (15pts)'}`);

    if (experienceCount > 0) {
        totalScore += experienceWeight;
        s3Score += experienceWeight;
        // console.log(`- Experience (>0): Yes (${experienceCount}) (+${experienceWeight})`);
    } else {
        // console.log(`- Experience (>0): No (+0)`);
    }


    // --- Section 4: Job Preference (20 คะแนน) ---
    // console.log("\n--- [Section 4] Job Preference (Max 20) ---");
    let s4Score = 0;

    // ตั้งค่า Default เป็น false ก่อน
    let foundProvDist = false;
    let foundJobType = false;
    let foundFacility = false;

    // ถ้ามีข้อมูล (Array ไม่ว่าง) ให้วนลูปหา
    if (workAreas && workAreas.length > 0) {
        // console.log(`- Found ${workAreas.length} work area record(s). Scanning...`);

        for (const area of workAreas) {
            // เช็คทีละ record ถ้าเจออันไหนมีค่า ก็ให้ถือว่า user มีข้อมูลส่วนนั้นแล้ว (OR Logic)
            if (!foundProvDist && hasValue(area.province_code) && hasValue(area.district)) {
                foundProvDist = true;
            }
            if (!foundJobType && hasValue(area.job_type_id)) {
                foundJobType = true;
            }
            if (!foundFacility && hasValue(area.facility_type_id)) {
                foundFacility = true;
            }
        }

        if (foundProvDist) { totalScore += 10; s4Score += 10; }
        if (foundJobType) { totalScore += 5; s4Score += 5; }
        if (foundFacility) { totalScore += 5; s4Score += 5; }

        // console.log(`- Province & District: ${foundProvDist} (+${foundProvDist ? 10 : 0})`);
        // console.log(`- Job Type: ${foundJobType} (+${foundJobType ? 5 : 0})`);
        // console.log(`- Facility: ${foundFacility} (+${foundFacility ? 5 : 0})`);
    } else {
        // console.log(`- WorkArea Data: Not Found (0 records) (+0)`);
    }
    // console.log(`> Section 4 Score: ${s4Score}`);


    // --- Section 5: License (Variable Weight) ---
    // console.log("\n--- [Section 5] License ---");
    let s5Score = 0;
    if (isPnNa) {
        // console.log(`- Logic: PN/NA skips license score (0 pts required)`);
    } else {
        // กลุ่มอื่น 15 คะแนน
        if (documentCount > 0) {
            totalScore += 15;
            s5Score += 15;
            // console.log(`- License Approved (>0): Yes (${documentCount}) (+15)`);
        } else {
            // console.log(`- License Approved (>0): No (+0)`);
        }
    }
    // console.log(`> Section 5 Score: ${s5Score}`);


    // --- Section 6: Address (5 คะแนน) ---
    // console.log("\n--- [Section 6] Address (Max 5) ---");
    if (addressCount > 0) {
        totalScore += 5;
        // console.log(`- Address (>0): Yes (${addressCount}) (+5)`);
    } else {
        // console.log(`- Address (>0): No (+0)`);
    }


    // --- Section 7: Others (12.5 คะแนน) ---
    // console.log("\n--- [Section 7] Others (Max 12.5) ---");
    let s7Score = 0;

    const o1 = hasValue(user.profile_picture);
    const o2 = user.is_verified_email === true; 
    const o3 = user.is_verified_phone === true;
    const o4 = hasValue(user.phone_number_encrypted);
    const o5 = hasValue(user.email_encrypted);

    if (o1) { totalScore += otherWeight; s7Score += otherWeight; }
    if (o2) { totalScore += otherWeight; s7Score += otherWeight; }
    if (o3) { totalScore += otherWeight; s7Score += otherWeight; }
    if (o4) { totalScore += otherWeight; s7Score += otherWeight; }
    if (o5) { totalScore += otherWeight; s7Score += otherWeight; }

    // console.log(`1. Profile Pic: ${o1}`);
    // console.log(`2. Verified Email Date: ${o2}`);
    // console.log(`3. Verified Phone Date: ${o3}`);
    // console.log(`4. Phone Encrypted: ${o4}`);
    // console.log(`5. Email Encrypted: ${o5}`);
    // console.log(`> Section 7 Score: ${s7Score}`);

    // --- Final Calculation ---
    const finalPercent = Math.min(totalScore, 100);
    // console.log(`\n========== SUMMARY ==========`);
    // console.log(`Raw Total Score: ${totalScore}`);
    // console.log(`Final Capped Percent: ${finalPercent.toFixed(2)}%`);
    // console.log(`=============================\n`);

    const [profile, created] = await UserProfileCompletenessModel.findOrCreate({
        where: { user_id: id },
        defaults: {
            completeness_percent: finalPercent.toFixed(2),
            created_by: user_id,
            updated_by: user_id,
        },
    });

    if (!created) {
        await profile.update({
            completeness_percent: finalPercent.toFixed(2),
            last_calculated: new Date(),
            updated_by: user_id,
        });
    }

    return profile;
};