FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json .

COPY yarn.lock .

RUN yarn install

COPY . .

# CMD [ "yarn", "build" ]

RUN yarn build


FROM nginx:1.23.3

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]