#!/bin/bash

cleanup() {
  echo "Stopping..."
  kill "$child1" "$child2"
}
trap cleanup SIGINT


echo "Starting project..."

(cd fe && npm run dev) &
child1=$!

(cd be && npm start) &
child2=$!

wait