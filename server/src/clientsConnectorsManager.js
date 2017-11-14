"use strict";

const httpStatus 		= require("http-status-codes");

const utils				= require("./utils");
const usersManager		= require("./bl/usersMngr");

// Realtime communication support

// SignalR, Socket.io, Internal, ...
class IClientsConnector {
	// Typically have a list of specific connections
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
			
			socket.emit("news", { hello: "world" });
			socket.on("my other event", function (data) {
				console.log(data);
			});
		});
	}
}

class clientsConnectorsManager {
	static initialize(server) {
		clientsConnectorsManager.ClientsConnectors = []; // List of ClientsConnectors

		clientsConnectorsManager.ClientsConnectors.push(new ClientsConnectorSocketIO(server));
	}
}

module.exports = clientsConnectorsManager;