const mongoose = require('mongoose');
const users = require("../models/Auth.js");

const updateChanelData = async function(req, res) {
  const { id: _id } = req.params;
  const { name, desc } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Chanel Unavailable..");
  }

  try {
    const updateData = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: name,
          desc: desc,
        },
      },
      { new: true }
    );

    res.status(200).json(updateData);
  } catch (error) {
    res.status(405).json({ message: error.message });
  }
};

const getAllChanels = async function(req, res) {
  try {
    const allChanels = await users.find();

    const allChanelDetails = [];
    allChanels.forEach(function(chanel) {
      allChanelDetails.push({
        _id: chanel._id,
        name: chanel.name,
        email: chanel.email,
        desc: chanel.desc,
      });  
    });
    res.status(200).json(allChanelDetails);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  updateChanelData,
  getAllChanels
};
