const fs = require('fs').promises;
const util = require('util');
const { exec: callbackExec } = require('child_process');
const mysql = require('mysql2/promise');
const Importer = require('mysql-import');
const path = require('path');
require('dotenv').config();

const exec = util.promisify(callbackExec);

const NPX_NYC_COMMAND =
  (unit) => `npx nyc --all --include ${unit} --reporter json-summary mocha test/unit/${unit}.js --exit`;

function readCoverageFile() {
  const COVERAGE_FILE_PATH = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
  return fs.readFile(COVERAGE_FILE_PATH).then(JSON.parse);
}

describe('Bonus', () => {
  let connection;

  beforeAll(async () => {
    const {
      MYSQL_USER,
      MYSQL_PASSWORD,
      MYSQL_HOST
    } = process.env;

    connection = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    const importer = new Importer(
      { user: MYSQL_USER, password: MYSQL_PASSWORD, host: MYSQL_HOST }
    );

    await importer.import('./StoreManager.sql');

    importer.disconnect();
  });

  afterEach(async () => {
    await exec('rm -rf coverage .nyc_output');
  });

  afterAll(async () => {
    await connection.execute('DROP DATABASE StoreManager')
    await connection.end();
  });
  
  describe('11 - Escreva testes para seus models', () => {
    beforeEach(async () => {
      await exec(NPX_NYC_COMMAND('models'));
    });
  
    it('Será validado que cobertura total das linhas dos arquivos na pasta `models` é maior ou igual a 80%', async () => {
      const coverageResults = await readCoverageFile();
      expect(coverageResults.total.lines.pct).toBeGreaterThanOrEqual(80);
    });
  });
  
  describe('12 - Escreva testes para seus services', () => {
    beforeEach(async () => {
      await exec(NPX_NYC_COMMAND('services'));
    });
  
    it('Será validado que cobertura total das linhas dos arquivos na pasta `services` é maior ou igual a 80%', async () => {
      const coverageResults = await readCoverageFile();
      expect(coverageResults.total.lines.pct).toBeGreaterThanOrEqual(80);
    });
  });
  
  describe('13 - Escreva testes para seus controllers', () => {
    beforeEach(async () => {
      await exec(NPX_NYC_COMMAND('controllers'));
    });
  
    it('Será validado que cobertura total das linhas dos arquivos na pasta `controllers` é maior ou igual a 80%', async () => {
      const coverageResults = await readCoverageFile();
      expect(coverageResults.total.lines.pct).toBeGreaterThanOrEqual(80);
    });
  });
})
