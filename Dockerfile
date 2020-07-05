FROM nginx:mainline-alpine
ADD dist/ /usr/share/nginx/html/
EXPOSE 80
