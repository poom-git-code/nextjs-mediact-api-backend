import { Context } from "koa";
import fs from "fs";
import path from "path";

export const uploadFile = async (ctx: Context) => {
  const { files } = ctx.request as any;
  if (!files || !files.file) {
    ctx.status = 400;
    ctx.body = { error: "No file uploaded" };
    return;
  }

  const file = files.file;
  const reader = fs.createReadStream(file.path);
  const filePath = path.join(__dirname, "../../uploads", file.name);
  const stream = fs.createWriteStream(filePath);
  reader.pipe(stream);

  ctx.status = 200;
  ctx.body = { message: "File uploaded successfully", filePath };
};