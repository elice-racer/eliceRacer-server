FROM node:20-alpine

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone \
    && apk del tzdata


WORKDIR /app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build


ENV HOST 0.0.0.0
EXPOSE 3000

CMD ["yarn", "start:prod"]