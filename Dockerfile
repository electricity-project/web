FROM node:20-alpine3.17 AS development

ENV NODE_ENV development

COPY ./package.json /react-app

WORKDIR /usr/app

COPY ./ /usr/app

RUN npm install

COPY . .

EXPOSE 3000

CMD npm start