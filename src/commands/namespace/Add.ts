import Debug from 'debug';
import { Command } from  '@chimpwizards/wand'
import { Config } from '@chimpwizards/wand'
import { CommandDefinition, CommandParameter, CommandArgument } from '@chimpwizards/wand/commons/command/'

import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';  


const chalk = require('chalk');
const debug = Debug("w:cli:api:namespace:add");

@CommandDefinition({ 
    description: 'Add an existing dependency to the workspace',
    alias: 'a',
    parent: 'namespace',  //TODO: Get the parent from the folder structure
    examples: [
        [`w a ns add git@github.com:acme/helloworld.git`, `Add a dependency into current workspace`],
        [`w a ns add --git git@github.com:acme/helloworld.git `, `Add a dependency into current workspace`],
    ]
})
export class Add extends Command  { 

    @CommandParameter({ description: 'Location of the dependency. if not provided dependencies/<name> will be used', alias: 'l',})
    location: string= "";    

    @CommandParameter({ description: 'Git repository URI. If not provided will be calculated using the workspace organization', alias: 'g',})
    git: string = "";

    execute(yargs: any): void {
        debug(`URL ${this.git}`)

    }

}

export function register ():any {
    debug(`Registering....`)
    let command = new Add();
    debug(`INIT: ${JSON.stringify(Object.getOwnPropertyNames(command))}`)

    return command.build()
}

