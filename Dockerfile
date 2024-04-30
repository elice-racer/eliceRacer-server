FROM node:20-alpine


WORKDIR /app
COPY . .

RUN yarn build


ENV HOST 0.0.0.0
EXPOSE 3000

CMD ["yarn", "start:prod"]