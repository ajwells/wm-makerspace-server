#!/usr/bin/env bash

tmux new -d -s ssh-window 'expect ./connect.exp $DBPASS'
tmux new -d -s server-window 'node ./server.js'
