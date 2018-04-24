#!/bin/bash

count=20

while true
do
    read
    for item in $(seq $count)
    do
	    echo "{\"result\": \"update\", \"return\": \"$item / $count\"}"
	    sleep 0.1
    done
    echo '{"result": "success", "return": "done"}'
done
