import fs from "fs";
import { resolve, basename } from "path";
import chai, { expect } from "chai";
import sinon, { SinonSandbox } from "sinon";
import sinonChai from "sinon-chai";
import parseEnv from "parse-dotenv";
import * as lib from "../lib/lib";

chai.use(sinonChai);

interface Callback {
	(): void;
}

const ENV_FILENAME = ".env";
const ENV_PATH = resolve(process.cwd(), ENV_FILENAME);
const SAMPLE_ENV_PATH = resolve(process.cwd(), ".env.example");
const SAMPLE_ENV_PATH_2 = resolve(process.cwd(), ".env.sample");

const createFile = (path: string, data = "", cb: Callback = () => { }) => {
	fs.writeFileSync(path, data, { encoding: "utf-8" });
};

const deleteFile = (path: string) => {
	if (fs.existsSync(path)) fs.unlinkSync(path);
};

const ENV_DATA = `APP_URL=https://awesome-app.io\r\n
APP_NAME=\r\n
APP_ENV=\r\n
APP_KEY=\r\n
APP_DEBUG=\r\n
# this is a comment
PORT=\r\n
LOG_CHANNEL=\r\n
DB_CONNECTION=\r\n
DB_HOST=\r\n
DB_PORT=\r\n
DB_DATABASE=\r\n
DB_USERNAME=\r\n
DB_PASSWORD=\r\n
test4="key#a23" # with comment
OTHER_ENV=`;

describe("sync-dotenv lib", () => {
	let sandbox: SinonSandbox;

	beforeEach(() => {
		createFile(ENV_PATH, ENV_DATA);
		createFile(SAMPLE_ENV_PATH);
		sandbox = sinon.createSandbox();
	});

	afterEach(() => sandbox.restore());

	after(() => {
		deleteFile(ENV_PATH);
		deleteFile(SAMPLE_ENV_PATH);
	});

	describe("fileExists()", () => {
		it("fails to find .env file", () => {
			deleteFile(ENV_PATH);
			expect(lib.fileExists(ENV_PATH)).equals(false);
		});

		it("finds .env file", () => {
			expect(lib.fileExists(ENV_PATH)).equals(true);
		});
	});

	describe("getObjKeys", () => {
		it("get object keys", () => {
			expect(lib.getObjKeys({ a: 1, b: 2 })).to.deep.equals(["a", "b"]);
		});
	});

	describe("writeToSampleEnv()", () => {
		beforeEach(() => createFile(ENV_PATH, ENV_DATA));

		it("writes to a .env.example successfully", done => {
			lib.writeToSampleEnv(SAMPLE_ENV_PATH, parseEnv(ENV_PATH));
			setTimeout(() => {
				expect(parseEnv(SAMPLE_ENV_PATH)).to.have.deep.property("PORT");
				done();
			}, 500);
		});

		it("failed to write a .env.example successfully", () => {
			const message = "Sync failed";
			sandbox.stub(fs, "writeFileSync").callsArgWith(2, { message });
			try {
				lib.writeToSampleEnv(SAMPLE_ENV_PATH, parseEnv(ENV_PATH));
			} catch (error: unknown) {
				expect((error as Error).message).contains(message);
			}
		});
	});

	describe("emptyObjProps()", () => {
		it("remove object property values", () => {
			const obj = { foo: "bar" };
			expect(lib.emptyObjProps(obj)).to.have.deep.property("foo", "");
		});
	});

	describe("getUniqueVarsFromEnv()", () => {
		it("remove object property values", async () => {
			const envObj = { name: "angry" };
			const exampleEnvObj = { foo: "bar", name: "bird" };
			const uniqueVarsArr = await lib.getUniqueVarsFromEnvs(
				envObj,
				exampleEnvObj
			);

			expect(uniqueVarsArr.length).equals(1);
			expect(uniqueVarsArr[0]).to.have.deep.property("name", "bird");
		});
	});

	describe("syncWithExampleEnv()", () => {
		it("sync .env with example env", async () => {
			createFile(ENV_PATH, ENV_DATA);

			const writeToExampleEnvSpy = sandbox.spy(lib, "writeToSampleEnv");

			await lib.syncWithSampleEnv(ENV_PATH, SAMPLE_ENV_PATH, { comments: false });

			expect(writeToExampleEnvSpy).callCount(1);
			expect(writeToExampleEnvSpy.getCalls()[0].lastArg).to.not.haveOwnProperty('__COMMENT_1__');
		});
	});

	describe("syncEnv", () => {
		before(() => createFile(SAMPLE_ENV_PATH_2));
		after(() => deleteFile(SAMPLE_ENV_PATH_2));

		it("fails to sync with source (.env) file", () => {
			lib
				.syncEnv(".env")
				.catch(error =>
					expect(error.message).equals("Cannot sync .env with .env")
				);
		});

		it("fails when .env is not found in project root", () => {
			deleteFile(ENV_PATH);
			lib
				.syncEnv()
				.catch(error => expect(error.message).equals(".env doesn't exists"));
		});

		it("throw error for missing sample env", () => {
			deleteFile(SAMPLE_ENV_PATH);
			lib.syncEnv().catch(error => {
				expect(error.message).equals(`.env.example not found`);
			});
		});

		it("throw error for missing sample env", () => {
			const sampleEnv = ".env.foo";
			lib.syncEnv(sampleEnv).catch(error => {
				expect(error.message).equals(`${sampleEnv} not found`);
			});
		});

		it("uses existing sample env if available", () => {
			const spy = sandbox.spy(lib, "syncWithSampleEnv");
			lib.syncEnv();
			expect(spy).callCount(1);
		});

		it("should error out if provided regex matched no files", async () => {
			const pattern = "env/invalid/*";
			await lib.syncEnv(undefined, undefined, pattern).catch(error => {
				expect(error.message).to.equal(`${pattern} did not match any file`);
			});
		});

		it("syncs multiple sample env files", async () => {
			const spy = sandbox.spy(lib, "syncWithSampleEnv");
			await lib.syncEnv(undefined, undefined, ".env.*");
			expect(spy).callCount(2);
		});

		it("strips all empty line entries", () => {
			createFile(ENV_FILENAME, ENV_DATA);
			const parsedEnv = parseEnv(ENV_FILENAME, { emptyLines: true });

			const envString = lib.envToString(parsedEnv);
			const emptyLines = Object.keys(parsedEnv).filter(key =>
				key.startsWith("__EMPTYLINE")
			).length;

			if (emptyLines > 9) {
				expect(envString.includes("__EMPTYLINE_")).to.be.false;
			}
		});

		it("error for invalid env source", () => {
			const env = "foo/.env";
			lib.syncEnv("", env).catch(({ message }) => {
				expect(message).equals(`${env} not found`);
			});
		});

		it("syncs with provided source", () => {
			lib.syncEnv(undefined, ".env").then((sampleEnv: any) => {
				expect(basename(sampleEnv)).equals(".env.example");
			});
		});
	});
});
