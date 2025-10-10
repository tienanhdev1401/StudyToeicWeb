import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import dotenv from "dotenv";
import compression from "compression";

// Import Observer pattern
import { EmailNotificationObserver } from "./observers/EmailNotificationObserver";
import { transporter } from "./repositories/admin/admin.LearnerRepository";
import { testSubject } from "./observers/TestSubject";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Khởi tạo và đăng ký Email Observer
const emailObserver = new EmailNotificationObserver(transporter);
testSubject.addObserver(emailObserver);
console.log("Email Observer đã được đăng ký");

// Middleware nén dữ liệu phản hồi để giảm kích thước
app.use(
  compression({
    level: 6, // Mức độ nén 0-9, 6 là mức tốt nhất về tốc độ/hiệu quả
    threshold: 1024, // Chỉ nén dữ liệu lớn hơn 1KB
  })
);

// Kết nối đến cơ sở dữ liệu
import "./config/db";

// Cấu hình CORS - QUAN TRỌNG: Phải đặt middleware CORS trước tất cả các route khác
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://learntoeicnow.tptienanh.website",
  "https://learntoeicnow.tptienanh.website",
  "https://hostservertoeic.tptienanh.website",
  "http://hostservertoeic.tptienanh.website",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như mobile apps hoặc curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware để xác định CORS một cách rõ ràng cho preflight requests
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Xử lý preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Sử dụng bodyParser để phân tích dữ liệu JSON
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session và flash
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Chỉ sử dụng secure cookie trong production
      httpOnly: true,
      sameSite: "lax", // Giúp bảo vệ CSRF
    },
  })
);

app.use(flash());

// Middleware để truyền thông điệp flash vào các template
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.messages = req.flash();
  next();
});

// Phục vụ static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: 86400000, // 1 ngày
  })
);
app.use(
  "/assets",
  express.static(path.join(__dirname, "assets"), {
    maxAge: 86400000, // 1 ngày
  })
);

// Import và đăng ký routes
import route from "./routes/index";
route(app);

// Error handling middleware - Xử lý các lỗi CORS và lỗi khác
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "CORS error: Origin not allowed",
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// Start server
import { initMarketingSchema } from "./services/scheduler/SchemaInit";
import { SchedulerService } from "./services/scheduler/SchedulerService";

(async () => {
  try {
    await initMarketingSchema();
    await SchedulerService.init();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    console.error("Server startup error", e);
    process.exit(1);
  }
})();
