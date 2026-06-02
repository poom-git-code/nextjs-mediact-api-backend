import * as DepartmentService from "./src/services/departmentService";

async function testDepartmentAPI() {
  try {
    console.log("🔍 Testing getAllDepartments function...");
    
    const departments = await DepartmentService.getAllDepartments();
    
    console.log("📊 Raw result from service:");
    console.log(JSON.stringify(departments, null, 2));
    
    // Check if any user data exists and if it's encrypted
    if (departments && departments.length > 0) {
      const dept = departments[0];
      console.log("\n🔍 First department analysis:");
      console.log("Department name:", dept.name);
      console.log("Department has data:", JSON.stringify(dept, null, 2).substring(0, 200) + "...");
    }
    
  } catch (error) {
    console.error("❌ Error testing department API:", error);
  }
}

// Run the test
testDepartmentAPI().then(() => {
  console.log("\n✅ Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
