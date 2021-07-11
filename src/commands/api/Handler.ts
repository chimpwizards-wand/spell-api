import Debug from 'debug';
import { Command } from  '@chimpwizards/wand'
const chalk = require('chalk');
const debug = Debug("w:cli:api:handler");

export class Handler  { 

    context: any= {};

    execute(yargs: any): void {
        debug(`Do Nothing`)
        debug(`YARGS ${JSON.stringify(yargs)}`)
        debug(`CONTEXT ${JSON.stringify(this.context)}`)
        
    } 

}
