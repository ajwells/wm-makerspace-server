#!/usr/bin/env bash

tmux new -d -s ssh-window 'expect ./connect.exp $DBPASS'
sleep 2
tmux new -d -s server-window 'node ./server.js'
