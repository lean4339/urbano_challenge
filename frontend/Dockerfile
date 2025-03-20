FROM node:16 as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .


RUN yarn install
RUN npx prettier --write .
COPY . .
RUN yarn build

#---

FROM nginx:alpine

COPY --from=build /app/build/ /var/www
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80