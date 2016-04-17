#!/usr/bin/env bash

tmux new -d -s ssh-window 'expect ./connect.exp $DBPASS'
sleep 5
tmux new -d -s server-window 'node ./wm-makerspace-server/server.js'
