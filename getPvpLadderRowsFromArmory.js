const axios = require('axios');
const fs = require('fs');
const util = require('util');
const path = require('path');

const PVP_BRACKET = require('./enums/pvp-bracket');
const BLIZZARD_LOCALE = require('./enums/blizzard-locale');
const config = require('./config');

const statFile = util.promisify(fs.stat);
const existsFile = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function getPvpLadderRowsFromArmory (bracket, wowClass = 'all',  specId = 'all') {
    if(!bracket) {
        throw 'bracket is required';
    }

    const fileName = path.join(__dirname, 'cache',  bracket + '.json');

    if(await existsFile(fileName)) {
        const modifiedDate = new Date((await statFile(fileName)).mtime);

        if(modifiedDate.toDateString() === (new Date()).toDateString()) {
            const json = await readFile(fileName);

            if(json) {
                let rows = JSON.parse(json);

                if(wowClass && wowClass !== 'all') {
                    rows = rows.filter(r => r.classId == wowClass);
                }

                if(specId && specId !== 'all') {
                    rows = rows.filter(r => r.specId == specId);
                }

                return Promise.resolve(rows.slice(0, 100));
            }
        }
    }

    const url = `${config.wowLadderBaseUrl}/${bracket}?locale=${BLIZZARD_LOCALE.en_GB}&apikey=${config.wowApiKey}`;
    const res = await axios.get(url);

    await writeFile(fileName, JSON.stringify(res.data.rows), 'utf8');

    return await getPvpLadderRowsFromArmory(bracket);
};

module.exports = getPvpLadderRowsFromArmory;