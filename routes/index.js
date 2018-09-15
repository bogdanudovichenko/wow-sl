var express = require('express');
var router = express.Router();

const PVP_BRACKET = require('../enums/pvp-bracket');
const getPvpLadderRowsFromArmory = require('../getPvpLadderRowsFromArmory');


router.get('/ladder', async (req, res) => {
  try {
    const rows = await getPvpLadderRowsFromArmory(req.query.pvpbracket || PVP_BRACKET.twoVs2, req.query.wowclass, req.query.specid);
    res.send(rows);
  } catch(err) {
    console.log(err);
    res.status(500).send('Internal server error.');
  }
});

module.exports = router;