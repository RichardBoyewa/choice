FROM node:9.5.0-alpine

WORKDIR /var/www/

COPY package.json package-lock.json /var/www/

RUN npm install

COPY . /var/www/

EXPOSE  80

CMD ["node","app.js"]
