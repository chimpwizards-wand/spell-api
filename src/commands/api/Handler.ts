import Debug from 'debug';
import {  Config } from  '@chimpwizards/wand'
const chalk = require('chalk');
const debug = Debug("w:cli:api:handler");
const Swagger = require('swagger-client')
import * as _ from 'lodash';  
import { ClientRequest } from 'http';

export class Handler  { 

    context: any= {};
    name: string = '';


    findOperation(yargs: any, client: any): string {
        debug(`findOperation`)
        var operationId = "";
        var method = this.context.command.parentConfig.command.name;
        var api = this.context.command.name;
        for(let p in client.spec.paths) {
            let path =  client.spec.paths[p];

            if ( p.startsWith(`\/${api}`)) {
                if ( path[method]) {
                    debug(`path found ${p}`)
                    var options = path[method].parameters.map( (x:any) => x.name);
                    var params = Object.keys(yargs);
                    var diff = _.difference(options,params)

                    if ( diff.length == 0 ) {
                        debug(`found operation match ${path[method].operationId}`)
                        operationId=path[method].operationId;
                        break;
                    }
                }
            }

            debug(`found`)
        }

        return operationId;
    }

    execute(yargs: any): void {
        debug(`Do Nothing`)
        debug(`YARGS ${JSON.stringify(yargs)}`)
        
        const config = new Config();
        if (config.inContext({dir: process.cwd()})) {
            const parentContext = config.load({})

            debug(`Check if api is already added into the config`)
            let exists;
            let swaggerUrl;
            parentContext.commands = parentContext.commands || {}

            if (parentContext.commands.api) {
                exists = _.find(parentContext.commands.api, {name: this.name})

                swaggerUrl = exists?.config?.url;
            }

            debug(`swaggerUrl: ${swaggerUrl}`)
            if (swaggerUrl) {
                debug(`API already registered`)
                debug(`URL: ${swaggerUrl}`)
                
                Swagger(swaggerUrl).then( (client: any) => {
                    debug(`calling endpoint`)

                    var operationId = this.findOperation(yargs, client)

                    const params: any = {
                        spec: client.spec,
                        operationId: operationId,
                        parameters: yargs,
                        securities: {
                            authorized: {
                                myOAuth2Implicit: {
                                    token: {
                                        access_token: 'myTokenValue',
                                    },
                                },
                            }
                        },                        
                        requestContentType: 'application/json',
                      };
                      
                    const req =Swagger.buildRequest({...params})
                    debug(`METHOD: ${req.method}`)
                    debug(`URL: ${req.url}`)
                    debug(`HEADERS: ${JSON.stringify(req.headers)}`)

                    Swagger.execute({...params}).then( (response:any) => {
                        debug(`Data reciveid`)
                        console.log(response.data)
                    });

                });
            }            
        }
    } 

}
