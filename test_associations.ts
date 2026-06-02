import { sequelize } from './src/config/database';
import { setupAssociations } from './src/models/associations';
import DepartmentModel from './src/models/DepartmentModel';
import UserModel from './src/models/UserModel';
import DepartmentTypeModel from './src/models/DepartmentTypesModel';
import DepartmentOperatingHoursModel from './src/models/DepartmentOperatingHoursModel';
import DepartmentSupervisorModel from './src/models/DepartmentSupervisorModel';
import ShiftTypeModel from './src/models/ShiftTypesModel';

(async () => {
  try {
    console.log('Setting up associations...');
    setupAssociations();
    
    console.log('Testing department query with includes...');
    const departments = await DepartmentModel.findAll({
      limit: 1,
      include: [
        {
          model: DepartmentTypeModel,
          as: "type",
          required: false,
        },
        {
          model: UserModel,
          as: "created_by_user",
          required: false,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: UserModel,
          as: "updated_by_user", 
          required: false,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: DepartmentOperatingHoursModel,
          as: "department_operating_hours",
          required: false,
        },
        {
          model: DepartmentSupervisorModel,
          as: "department_supervisors",
          required: false,
          include: [
            {
              model: UserModel,
              as: "user",
              required: false,
            },
          ],
        },
        {
          model: ShiftTypeModel,
          as: "shift_types",
          required: false,
        },
      ],
    });

    if (departments.length > 0) {
      const dept = departments[0];
      console.log('\nDepartment found:');
      console.log('- ID:', dept.id);
      console.log('- Name:', dept.name);
      console.log('- Created by:', dept.created_by);
      console.log('- Updated by:', dept.updated_by);
      
      console.log('\nCreated by user:');
      if (dept.created_by_user) {
        console.log('- User ID:', dept.created_by_user.id);
        console.log('- User name:', dept.created_by_user.first_name, dept.created_by_user.last_name);
      } else {
        console.log('- No created_by_user data');
      }
      
      console.log('\nUpdated by user:');
      if (dept.updated_by_user) {
        console.log('- User ID:', dept.updated_by_user.id);
        console.log('- User name:', dept.updated_by_user.first_name, dept.updated_by_user.last_name);
      } else {
        console.log('- No updated_by_user data');
      }
      
      console.log('\nDepartment supervisors:');
      if (dept.department_supervisors && dept.department_supervisors.length > 0) {
        dept.department_supervisors.forEach((supervisor, index) => {
          console.log(`- Supervisor ${index + 1}:`, supervisor.user ? `${supervisor.user.first_name} ${supervisor.user.last_name}` : 'No user data');
        });
      } else {
        console.log('- No supervisors');
      }
      
      console.log('\nAll associations working correctly!');
    } else {
      console.log('No departments found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
})();
