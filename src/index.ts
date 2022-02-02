
import Config from 'config';
import { v2 } from '@google-cloud/translate';
import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Boom from '@hapi/boom';

const { Translate } = v2;


class TranslateAPI {
	private ProjectID: string;
	private Client: v2.Translate;
	private HTTPD: Hapi.Server;

	constructor() {

		this.ProjectID = Config.get('google.projectId');

		console.log(`Creating Translation Client for project ${this.ProjectID}`);

		this.Client = new Translate({
			projectId: this.ProjectID,
			key: Config.get('google.apiKey'),
		});

		this.HTTPD = new Hapi.Server({
			... Config.get('httpd')
		});
	}

	async start() {
		console.log("Registering Routes");

		this.HTTPD.route({
			path: "/api/v1/translate",
			method: "GET",
			options: {
				validate: {
					query: Joi.object({
						text: Joi.string().required(),
						key: Joi.string().required(),
						to: Joi.string().optional().default("en"),
						mode: Joi.string().optional().allow("simple", "json").default("json"),
					}),
				}
			},
			handler: async (req, h) => {
				const query = req.query as {
					text: string,
					key: string,
					to?: string,
					mode?: string,
				};

				const allowedKeys = Config.get('allowedKeys') as string[];
				if (!allowedKeys.includes(query.key)) {
					return Boom.unauthorized("Invalid API Key");
				}

				const destLang = query.to || "en";
				const resultMode = query.mode || "json";
				const result = await this.Client.translate(query.text, destLang);

				if (resultMode.toLowerCase() === "json") {
					return result;
				} else if (resultMode.toLowerCase() === "simple") {
					return result[0];
				} else {
					return Boom.badRequest("Unrecognised result mode, allowed modes are 'simple' and 'json'.");
				}
			}
		});

		console.log("Starting HTTPD");
		await this.HTTPD.start();

		console.log("API is Ready!");
	}
}
const API = new TranslateAPI();
API.start();