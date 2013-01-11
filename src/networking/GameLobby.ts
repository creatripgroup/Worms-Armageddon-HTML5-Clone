/**
 *  
 * GameLobby.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */

///<reference path="../Game.ts"/>
///<reference path="ServerUtilies.ts"/>

// Had to give up the benfits of types in this instance, as a problem with the way ES6 proposal module system
// works with Node.js modules. http://stackoverflow.com/questions/13444064/typescript-conditional-module-import-export
try
{   
    var Events = require('./Events');
    var ServerUtilies = require('./ServerUtilies');
    var Util = require('util');
    var ServerSettings = require('./ServerSettings');

} catch (error){}


class GameLobby
{
    players: number[];
    name: string;
    id: string;
    numberOfPlayers: number;
    isPrivate: bool;

    static gameLobbiesCounter = 0;

    constructor (name :string, numberOfPlayers : number)
    {
        this.name = name;   
        this.isPrivate = false;
        this.players = [];      
        this.numberOfPlayers = numberOfPlayers;

    }

    server_init()
    {
       this.id = ServerUtilies.createToken() + GameLobby.gameLobbiesCounter;
       GameLobby.gameLobbiesCounter++;
    }

    client_init()
    {
        //Have the host client setup all the player objects with all the other clients ids
        Client.socket.on(Events.gameLobby.START_GAME_HOST, function (players)
        {
            Logger.debug("Events.client.START_GAME " + players);
            var playerIds = JSON.parse(players);
            GameInstance.start(playerIds);

            //Once we have init the game, we most send all the game info to the other players
            Client.socket.emit(Events.gameLobby.UPDATE, GameInstance.players);
        });

        // Start the game for all other playrs by passing the player information create
        // by the host client to them.
        Client.socket.on(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, function (players)
        {
            Logger.debug("Events.client.START_GAME_FOR_OTHER_CLIENTS" + players);
            GameInstance.players = JSON.parse(players);
            GameInstance.start();
        });

    }

    join(userId,socket)
    {
        console.log("Player " + userId + " added to gamelobby " + this.id + " and name " + this.name);
        
        // Add the player to the gameLobby socket.io room
        socket.join(this.id);

        // Write the gameLobbyId to the users socket
        socket.set('gameLobbyId', this.id);

        this.players.push(userId);
    }

    startGame(io)
    {
       
        if (this.players.length == this.numberOfPlayers)
        {         
            io.sockets.in(this.id).emit(Events.gameLobby.START_GAME_HOST, JSON.stringify(this.players));
        }
    }

}


declare var exports: any;
if (typeof exports != 'undefined') {
  (module).exports = GameLobby;
}
