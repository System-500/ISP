    
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM nginx:alpine


COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=build /app/dist /usr/share/nginx/html


COPY img/avatar.png /usr/share/nginx/html/img/avatar.png

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]