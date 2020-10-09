FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/parser

COPY parser.js ./
COPY package.json ./
COPY package-lock.json ./
COPY cache.txt ./

RUN npm install

CMD [ "node", "parser.js" ]
