#!/bin/bash
MYSQL_HOSTS="mysql80 mysql84"

for hostname in ${MYSQL_HOSTS}; do
  echo $hostname + node 22
    docker run -it --network=powersync-mysql-zongji_default -e MYSQL_HOST=$hostname -w /build -v $PWD:/build node:20 npm test
done
