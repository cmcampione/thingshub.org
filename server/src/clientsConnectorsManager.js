"use strict";

const httpStatus 		= require("http-status-codes");

const utils				= require("./utils");
const usersManager		= require("./bl/usersMngr");

// Realtime communication support

// SignalR, Socket.io, Internal, ...
class IClientsConnector {
	api(usersIds, infos) {}

	onCreateThing(usersIds, thingDTO) {}
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
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 11));

			let user = await usersManager.findUserByMasterApiKey(token);
			if (!user)
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 12));

			let userId = user._id.toString();
			let userSockets = self.connections.get(userId);
			if (!userSockets) {
				self.connections.set(userId, new Array());
				userSockets = self.connections.get(userId);
			}
			userSockets.push(socket);

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
					break;
				}
			});

		});
	}
	api(usersIds, info) {
		let self = this;
		usersIds.forEach(userId => {
			let connections = self.connections.get(userId);
			if (!connections)
				return;
			connections.forEach(socket => {
				socket.emit("api", info);
			});
		});
	}
	
	onCreateThing(usersIds, thingDTO) {
		for(let userId of usersIds) {
			let connections = this.connections.get(userId);
			if (!connections)
				return;
			for(let socket in connections) {
				socket.emit("api", thingDTO);
			}
		}
	}
}

class ClientsConnectorsManager {
	static initialize(server) {
		ClientsConnectorsManager.ClientsConnectors = []; // List of ClientsConnectors

		ClientsConnectorsManager.ClientsConnectors.push(new ClientsConnectorSocketIO(server));
	}
	static api(usersIds, info) {
		ClientsConnectorsManager.ClientsConnectors.forEach(element => {
			element.api(usersIds, info);
		});
	}
	static onCreateThing(usersIds, thingDTO) {
		ClientsConnectorsManager.ClientsConnectors.forEach(element => {
			element.api(usersIds, thingDTO);
		});
	}
}

module.exports = ClientsConnectorsManager;