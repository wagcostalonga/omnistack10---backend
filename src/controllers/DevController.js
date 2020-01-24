const axios = require('axios')
const { ObjectId } = require('mongoose').Types.ObjectId;
const Dev = require('../models/Dev')
const parteStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');


exports.index = async (request, response) => {
        const devs = await Dev.find();
        return response.json(devs);
}

exports.store = async (request, response) => {
    const { github_username, techs, latitude, longitude } = request.body

    let dev = await Dev.findOne({github_username});

    if(!dev) {
        const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
        
            const { name = login, avatar_url, bio} = apiResponse.data;
        
            const techsArray = parteStringAsArray(techs)
            
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
            
            dev = await Dev.create({
                name,
                github_username,
                bio,
                avatar_url,
                techs: techsArray,
                location
            })

            const sendSocketMessageTo = findConnections({ latitude, longitude}, techsArray
                )

                sendMessage(sendSocketMessageTo, 'new-dev', dev);
    
        }
        return response.json(dev);
    }