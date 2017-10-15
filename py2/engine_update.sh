#!/bin/bash

while true
do
    read
    echo '{"result": "update", "return": "1"}'
    sleep 1
    echo '{"result": "update", "return": "2"}'
    sleep 1
    echo '{"result": "update", "return": "3"}'
    sleep 1
    echo '{"result": "success", "return": "done"}'
done
