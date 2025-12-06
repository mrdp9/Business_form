FROM nginx:latest
COPY . /usr/share/nginx/html/
Expose 80
