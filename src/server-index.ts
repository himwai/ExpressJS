import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import fs from "node:fs";

import apiRouter from "./api";

const envLocalPath = ".env.local";
const envPath = fs.existsSync(envLocalPath) ? envLocalPath : ".env";
dotenv.config({ path: envPath });

const app = express();
const port: number = parseInt(process.env.PORT || "3000", 10);

// 使用 Helmet 安全中间件
app.use(
  helmet({
    // 内容安全策略配置
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // 默认只允许同源资源
        scriptSrc: ["'self'"], // 只允许同源脚本
        styleSrc: ["'self'", "'unsafe-inline'"], // 允许同源和行内样式
        imgSrc: ["'self'", "data:"], // 允许同源和 data URI 图片
        fontSrc: ["'self'"], // 允许同源字体
        objectSrc: ["'none'"], // 禁止所有对象（Flash等）
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null, // 生产环境升级HTTPS请求
      },
    },
    // 其他 Helmet 选项保持默认
  })
);

// Enable CORS for all routes
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? [
      "http://localhost"
    ] : true, // Allow any origin in development,
    credentials: true,
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允许的 HTTP 方法
    // allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
  })
);

// Parse JSON bodies
app.use(express.json());

// 基础路由
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "cap-cws-express is healthy",
    timestamp: new Date().toISOString(),
  });
});

// 使用计数器路由
app.use("/api", apiRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`服務器運行在 http://localhost:${port}`);
  console.log(`環境: ${process.env.NODE_ENV || "development"}`);
});

export default app;
