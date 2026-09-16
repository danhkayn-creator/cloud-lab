# Câu 32: Khai báo Base Image Node.js 
FROM node:20

# Câu 33: Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Câu 34: Sao chép file khai báo dependency vào container
COPY package*.json ./

# Câu 35: Cài đặt các package
RUN npm install

# Câu 36: Sao chép toàn bộ source code còn lại vào container
COPY . .

# Câu 37: Khai báo port mà backend lắng nghe
EXPOSE 5000

# Câu 38: Thiết lập lệnh khởi động container
CMD ["npm", "start"]