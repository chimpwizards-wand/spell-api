#!/usr/bin/env node

import Debug from 'debug';
import {Root} from '@chimpwizards/wand/Root';
const debug = Debug("w:cli:api");

Root.init({ directories: [ __dirname ]})