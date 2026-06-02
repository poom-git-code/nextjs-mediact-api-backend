import * as DepartmentService from "./src/services/departmentService";

async function testDepartmentUserDataEncryption() {
  try {
    console.log("🔍 Testing department service user data encryption...");
    
    // Test a simpler function that returns user data
    const department = await DepartmentService.getDepartmentByIdWithDetails(1);
    
    console.log("📊 Raw result from service:");
    console.log(JSON.stringify(department, null, 2));
    
  } catch (error) {
    console.error("❌ Error testing department API:", error);
  }
}

// Run the test
testDepartmentUserDataEncryption().then(() => {
  console.log("\n✅ Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
