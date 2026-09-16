# Câu 51: Khai báo Node.js Image làm Base Image để build
FROM node:20 AS builder

# Câu 52: Thiết lập thư mục làm việc
WORKDIR /app

# Câu 53: Sao chép package.json và package-lock.json
COPY package*.json ./

# Câu 54: Cài đặt các package
RUN npm install

# Câu 55: Sao chép toàn bộ source code React vào container
COPY . .

# Câu 56: Build React Application thành các file tĩnh
RUN npm run build

# Giai đoạn 2: Dùng Nginx để phục vụ file tĩnh
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]