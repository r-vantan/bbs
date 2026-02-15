import type * as Party from "partykit/server";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const body = await req.json();

			this.room.broadcast(JSON.stringify(body));

			return new Response("OK", { status: 200 });
		}
		return new Response("Method not allowed", { status: 405 });
	}
}
