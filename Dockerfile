FROM  node:14.12.0

RUN node --version

COPY .env .
COPY main.js .
COPY package*.json ./
RUN npm install


CMD [ "node main.js" ]
