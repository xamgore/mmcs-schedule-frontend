FROM nginx:latest
MAINTAINER Artem Konenko <konenko@sfedu.ru>
RUN rm /etc/nginx/conf.d/default.conf
COPY ./conf /etc/nginx/conf.d/
COPY ./www /var/www