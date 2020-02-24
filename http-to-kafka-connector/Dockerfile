FROM mhart/alpine-node:12

ARG WORK_DIR
ENV npm_config_cache=/tmp
WORKDIR /app

COPY ${WORK_DIR} .

RUN npm install

# set your port
ENV PORT 8080
# expose the port to outside world
#EXPOSE  8080

# start command as per package.json
CMD ["npm", "start"]
