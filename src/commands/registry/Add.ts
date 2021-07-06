import Debug from 'debug';
import { Command } from  '@chimpwizards/wand'
import { Config } from '@chimpwizards/wand'
import { CommandDefinition, CommandParameter, CommandArgument } from '@chimpwizards/wand/commons/command/'

import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';  

const chalk = require('chalk');
const debug = Debug("w:cli:api:registry:add");

@CommandDefinition({ 
    description: 'Add an existing dependency to the workspace',
    alias: 'a',
    parent: 'registry',  //TODO: Get the parent from the folder structure
    examples: [
        [`w a r add petstore --swagger https://petstore.swagger.io/v2/swagger.json`, `Add a api into the registry`],
        [`w a r add --name petstore --swagger https://petstore.swagger.io/v2/swagger.json`, `Add a api into the registry`],
    ]
})
export class Add extends Command  { 

    @CommandArgument({ description: 'API Name', name: 'api-name'})
    @CommandParameter({ description: 'API Name', alias: 'n',})
    name: string = '';

    @CommandParameter({ description: 'URL for the swagger definition', alias: 's',})
    swagger: string= "";    

    execute(yargs: any): void {
        debug(`Swagger ${this.swagger}`)

        const config = new Config();

        if (config.inContext({dir: process.cwd()})) {
            const parentContext = config.load({})

            debug(`Check if api is already added into the config`)
            let exists =  false;
            parentContext.commands = parentContext.commands || {}

            if (parentContext.commands.api) {
                exists = _.find(parentContext.commands.api, {name:this.name})
            } else {
                debug(`Creating apis bucket in config`)
                parentContext.commands['api'] = []
            }

            if (exists) {
                debug(`API already registered`)
            } else {
                debug(`Add the api to the current context becase doesn't exists`)
                let api: any = {
                    name: this.name,
                    type: "swagger",
                    config: {
                        url: this.swagger,
                        handler: `"@chimpwizards-wand/spell-api/Define"`,
                    }
                }
                
                parentContext.commands.api.push(api)
                config.save( {context: parentContext} )
            }

        }
    }

}

export function register ():any {
    debug(`Registering....`)
    let command = new Add();
    debug(`INIT: ${JSON.stringify(Object.getOwnPropertyNames(command))}`)

    return command.build()
}

