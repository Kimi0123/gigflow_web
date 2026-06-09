"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const mongodb_1 = require("./database/mongodb");
dotenv_1.default.config();
const port = Number(process.env.PORT) || 5000;
const startServer = async () => {
    await (0, mongodb_1.connectDB)();
    app_1.default.listen(port, () => {
        console.log(`GigFlow API running on http://localhost:${port}`);
    });
};
startServer().catch((error) => {
    console.error("Failed to start GigFlow API:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map