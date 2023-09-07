FROM alpine

RUN apk add --no-cache \
  nodejs \
  npm \
  python3 \
  py3-pip \
  git

COPY . /app
WORKDIR /app

RUN npm i
RUN npm run build

CMD node build
EXPOSE 3000
