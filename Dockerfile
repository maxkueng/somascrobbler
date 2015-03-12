FROM node:0.12
MAINTAINER Max Kueng <me@maxkueng.com>

EXPOSE 3000

COPY . /src
RUN cd /src; npm install

VOLUME /src/data

WORKDIR /src

ENTRYPOINT [ "/usr/local/bin/npm", "run" ]

CMD [ "start" ]
