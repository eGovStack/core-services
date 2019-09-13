FROM egovio/alpine-node-builder-10:yarn

COPY package.json /opt/package.json

COPY src /opt/src

RUN cd /opt && npm install
WORKDIR /opt

# set your port
ENV PORT 8080
# expose the port to outside world
#EXPOSE  8080

# start command as per package.json
CMD ["npm", "start"]