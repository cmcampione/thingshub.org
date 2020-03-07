"use strict";

const moment 			= require('moment');
const httpStatusCodes 	= require("http-status-codes");

const logger			= require("./logger");
const utils				= require("./utils");
const usersManager		= require("./bl/usersMngr");

// Realtime communication support

// SignalR, Socket.io, Internal, ...
class IClientsConnector {

	api(usersIds, infos) {}

	onCreateThing(usersIds, thingDTO) {}
	onUpdateThing(usersIds, thingDTOs) {}
	onUpdateThingValue(usersIds, thingId, value, asCmd) {}
}

// Socket.io support
class ClientsConnectorSocketIO extends IClientsConnector {

	constructor(server) {
		super();

		let self = this;
		
		this.connections = new Map();

		this.io = require("socket.io")(server);

		this.io.use(async (socket, next) => {
			
			let token = socket.handshake.query.token;
			if (!token)
				return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 11));

			let user = await usersManager.findUserByMasterApiKey(token);
			if (!user) {
				try {
					const tk = utils.verifyToken(token);
					user = await usersManager.findUserById(tk.sub);
					if (!user)
						return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 112));
				}
				catch(e) {
					return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 12));	
				}
			}

			let userId = user._id.toString();
			let userSockets = self.connections.get(userId);
			if (!userSockets) {
				self.connections.set(userId, new Array());
				userSockets = self.connections.get(userId);
			}
			userSockets.push(socket);

			logger.info("ClientsConnectorSocketIO.Connection.username = " + user.username,{ code: 117 });
			logger.info("ClientsConnectorSocketIO.Connection.connections.size = " + self.connections.size, { code: 118 });
			logger.info("ClientsConnectorSocketIO.Connection.userSockets.length = " + userSockets.length, { code: 119 });

			return next();
		});
		
		this.io.on("connection", function (socket) {

			socket.on("disconnect", (reason) => {

				var mapIter = self.connections.entries();
				for(let connection of mapIter) {

					let userId 		= connection[0];
					let userSockets = connection[1];
					let socketToRemove = userSockets.find(s => { return s.id == socket.id; });
					if (!socketToRemove) {
						continue;
					}
					let i = userSockets.indexOf(socketToRemove);
					userSockets.splice(i, 1);
					if (userSockets.length == 0)
						self.connections.delete(userId);
					logger.info("ClientsConnectorSocketIO.disconnect.userSockets.length = " + userSockets.length, { code: 120 });
					break;
				}
				logger.info("ClientsConnectorSocketIO.disconnect.connections.size = " + self.connections.size, { code: 121 });
			});

		});
	}

	api(usersIds, info) {
		let self = this;
		usersIds.forEach(userId => {
			let connections = self.connections.get(userId.toString());
			if (!connections)
				return;
			connections.forEach(socket => {
				socket.emit("api", info);
			});
		});
	}
	
	onCreateThing(usersIds, thingDTO) {
		// Dummy
		for(let userId of usersIds) {
			let connections = this.connections.get(userId.toString());
			if (!connections)
				continue;
			for(let socket of connections) {
				socket.emit("onCreateThing", thingDTO);
			}
		}
	}
	onUpdateThing(usersIds, thingDTOs) {
		
		for(let userId of usersIds) {

			let connections = this.connections.get(userId.toString());
			if (!connections)
				continue;

			let thingDTO = thingDTOs[userId];
			if (!thingDTO)
				continue;

			for(let socket of connections) {
				socket.emit("onUpdateThing", thingDTO);
			}
		}
	}
	onUpdateThingValue(usersIds, thingId, value, asCmd) {
		
		for(let userId of usersIds) {

			let connections = this.connections.get(userId.toString());
			if (!connections)
				continue;

			for(let socket of connections) {
				socket.emit("onUpdateThingValue", thingId, value, asCmd);
			}
		}
	}
}

class RealtimeNotifier {
	
	static initialize(server) {

		RealtimeNotifier.ClientsConnectors = []; // List of ClientsConnectors
		RealtimeNotifier.ClientsConnectors.push(new ClientsConnectorSocketIO(server));
	}
	static onAPI(usersIds, info) {

		RealtimeNotifier.ClientsConnectors.forEach(element => {
			element.api(usersIds, info);
		});
	}
	static onCreateThing(usersIds, thingDTO) {

		RealtimeNotifier.ClientsConnectors.forEach(element => {
			element.onCreateThing(usersIds, thingDTO);
		});
	}
	static onUpdateThing(usersIds, thingDTOs) {

		RealtimeNotifier.ClientsConnectors.forEach(element => {
			element.onUpdateThing(usersIds, thingDTOs);
		});
	}
	static onUpdateThingValue(usersIds, thingId, value, asCmd) {

		RealtimeNotifier.ClientsConnectors.forEach(element => {
			element.onUpdateThingValue(usersIds, thingId, value, asCmd);
		});
	}
}

module.exports = RealtimeNotifier;