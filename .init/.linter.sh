#!/bin/bash
cd /home/kavia/workspace/code-generation/notemaster-110611-c856a246/frontend_notes_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

