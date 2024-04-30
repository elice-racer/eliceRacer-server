FROM node:20-alpine

WORKDIR /usr/src/app
COPY . .

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000
CMD ["node", "dist/main"]
