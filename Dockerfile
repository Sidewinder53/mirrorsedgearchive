FROM nginx:alpine
ADD dist/ /usr/share/nginx/html/
ADD templates/error-pages/ /usr/share/nginx/error-pages
COPY templates/nginx/default.conf /etc/nginx/conf.d
EXPOSE 80
