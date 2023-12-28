#!/usr/bin/env bash

zip -r -FS ./dist/disposable-container.zip * --exclude '*.git*' --exclude 'build.sh'
