import Debug from 'debug';
import { Command } from  '@chimpwizards/wand'
import { Config } from '@chimpwizards/wand'
import { CommandDefinition, CommandParameter, CommandArgument } from '@chimpwizards/wand/commons/command/'

import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';  
import { runInThisContext } from 'vm';
import { config } from 'yargs';
//import Swagger from 'swagger-client'
const Swagger = require('swagger-client')


const chalk = require('chalk');
const debug = Debug("w:cli:api:registry:define");

@CommandDefinition({ 
    description: 'Pull swagger definitions',
    alias: 'd',
    parent: 'registry',  //TODO: Get the parent from the folder structure
    examples: [
        [`w a r define petstore`, `Pulls API definition from swagger document`],
        [`w a r define --name petstore --swagger https://petstore.swagger.io/v2/swagger.json`, `Pulls API definition from swagger document`],
    ]
})
export class Define extends Command  { 

    @CommandArgument({ description: 'API Name', name: 'api-name'})
    @CommandParameter({ description: 'API Name', alias: 'n',})
    name: string = '';

    @CommandParameter({ description: 'URL for the swagger definition', alias: 's',})
    swagger: string= "";   

    execute(yargs: any): void {
        debug(`Name: ${this.name}`)
        this.getDefinition().then(commands => {
            debug(`COMMANDS: ${JSON.stringify(commands)}`)
            console.log(JSON.stringify(commands));
        });

    }

    async getDefinition() {
        debug(`getDefinition`)

        const config = new Config();
        var commands: any = []


        if (config.inContext({dir: process.cwd()})) {
            const parentContext = config.load({})

            debug(`Check if api is already added into the config`)
            let exists;
            parentContext.commands = parentContext.commands || {}

            if (parentContext.commands.api) {
                exists = _.find(parentContext.commands.api, {name:this.name})
            }

            var swaggerUrl = exists.config?.url||this.swagger;

            if (swaggerUrl) {
                debug(`API already registered`)
                debug(`URL: ${swaggerUrl}`)

                await Swagger(swaggerUrl).then( (client: any) => {
                    //client.spec // The resolved spec
                    //client.originalSpec // In case you need it
                    //client.errors // Any resolver errors
                
                    // Tags interface
                    //client.apis.pet.addPet({id: 1, name: "bobby"}).then(...)
                
                    // TryItOut Executor, with the `spec` already provided
                    //client.execute({operationId: 'addPet', parameters: {id: 1, name: "bobby") }).then(...)

                    debug(`Swagger document found`)
                    for (const key in client.spec.paths) {
                        var pathSpec = client.spec.paths[key];
                        

                        for(const action in pathSpec) {
                            var actionSpec = pathSpec[action]

                            var command: any = {
                                name: key
                            }

                            this.addCommand(command, commands, action);

                        }
                        
                        

                    }
                    debug(`Commands ready: ${JSON.stringify(commands)}`)

                    
                });

            } else {
                console.log(chalk.red(`API is not registered`))
            }
        }

        return commands;

    }

    addCommand(command: any, commands: any, parent: string) {
        debug(`addCommand ${command.name}`)
        var parentCommand: any = this.findCommand(parent, commands);
        if (!parentCommand) {
            parentCommand={name:parent}
            commands.push(parentCommand)
        }
        parentCommand.commands = parentCommand.commands || []
        parentCommand.commands.push(command);

    }

    findCommand(command: string, commands: any) {
        debug(`findCommand ${command}`)
        var parentCommand: any;
        for(var the1 in commands) {
            var theone: any = commands[the1];
            if ( theone.name == command ) {
                parentCommand= theone;
            } else {
                if ( theone.commands && Object.keys(theone.commands).length > 0) {
                    parentCommand= this.findCommand(command, theone.commands)
                }
            }

            if (parentCommand) break;
        }

        return parentCommand;

    }

}



export function register ():any {
    debug(`Registering....`)
    let command = new Define();
    debug(`INIT: ${JSON.stringify(Object.getOwnPropertyNames(command))}`)

    return command.build()
}

/**
 * REFERENCE
 * 
 * - https://www.npmjs.com/package/swagger-client/v/3.8.24?activeTab=readme
 */