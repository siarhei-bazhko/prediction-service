FROM  node:14.12.0

COPY lsa-data .
COPY .env .
COPY main.js .
COPY package*.json ./
RUN npm install


CMD node main.js
