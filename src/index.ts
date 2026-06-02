import app from "./app";
import { sequelize } from "./config/database";
import config from "./config/config";
import "./jobs/notificationBoothEventsCronJob"
import "./jobs/adCronJob"
import "./jobs/eventCronJob"
import "./jobs/jobCronJob"
import "./jobs/rewardExpiryCronJob"
import { setupAssociations } from "./models/associations";
import { createServer } from 'http';

const PORT = process.env.PORT || config.server.port || 8080;

(async () => {
  try {
    setupAssociations();
    
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    const server = createServer(app.callback());
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
})();
