const User = require('../models/Auth');
const mongoose = require('mongoose');
const Subscriber = require('../models/Subscriber');
const Subscription = require('../models/Subscriptions');
const videoFiles = require('../models/videoFiles');


exports.updateChanelData = async (req, res) => {
    try {
        const {id:_id}=req.params;
        const {name,desc} =req.body;

        if(!mongoose.Types.ObjectId.isValid(_id)){
            return res.status(404).send("Channel Unavailable")
        }

        const updateData = await User.findByIdAndUpdate(_id,{
            $set:{
                'name':name,
                'desc':desc
            }   
        },
        {
            new:true
        })

        console.log("updated data", updateData)


        res.status(200).json({
            updateData
        })
    } catch (error) {
        res.status(405).json({
            message:error.message
        })
    }
}

exports.getAllChannels = async (req, res) => {
    try {
        const allChannels = await User.find({});
        const allChannelDetails = [];
        allChannels.forEach(channel=>{
            allChannelDetails.push({
                _id:channel._id,
                name:channel.name,
                email:channel.email,
                desc:channel.desc,
                
            })
        })
        res.status(200).json({
            allChannelDetails
        })
    } catch (error) {
        res.status(404).json({
            message: error.message
        })      
    }
}

exports.subscribeChannel = async (req, res) => {
    const { chanelId } = req.params;
    const userId = req.userId;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const channel = await User.findById(chanelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel (User) not found" });
        }

        // Check if the user is already subscribed to the channel
        const existingSubscription = await Subscription.findOne({ subscriberId: userId, chanelId: chanelId });
        if (existingSubscription) {
            return res.status(400).json({ message: "Already subscribed to this channel" });
        }

        // Create new subscriber and subscription records
        const newSubscriber = new Subscriber({ userId, chanelId });
        const newSubscription = new Subscription({ subscriberId: userId, chanelId });
        
        // Save both documents
        await newSubscriber.save();
        await newSubscription.save();

        // Update user and channel records
        user.subscriptions.push(newSubscription._id);
        channel.subscribers.push(newSubscriber._id);
        await user.save();
        await channel.save();

        res.status(200).json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing to channel:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.unsubscribeChannel = async (req, res) => {
    const { channelId } = req.params;
    const userId = req.userId;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the subscriber entry exists for the channel
        const subscriberEntry = user.subscribers.find(subscriber => subscriber.chanelId === channelId);
        if (!subscriberEntry) {
            return res.status(400).json({ message: "Subscriber entry not found for this channel" });
        }

        console.log("Before filtering subscribers:", user.subscribers);
        user.subscribers = user.subscribers.filter(subscriber => subscriber.chanelId !== channelId);
        console.log("After filtering subscribers:", user.subscribers);
       
        console.log("Before filtering subscriptions:", user.subscriptions);
        user.subscriptions = user.subscriptions.filter(subscription => subscription.chanelId !== channelId);
        console.log("After filtering subscriptions:", user.subscriptions);
        
        // Save the updated user record
        await user.save();

        // Delete subscriber entry
        const deletedSubscriber = await Subscriber.deleteOne({ userId: userId, chanelId: channelId });
        console.log("Deleted subscriber:", deletedSubscriber);

        // Delete subscription entry
        const deletedSubscription = await Subscription.deleteOne({ subscriberId: userId, chanelId: channelId });
        console.log("Deleted subscription:", deletedSubscription);

        res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Error unsubscribing from channel:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getChanelDetails = async (req, res) => {
    const { chanelId} = req.params;

    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const chanel = await videoFiles.find({videoChanel : chanelId });

        const channelName = chanel[0].Uploder;

        res.status(200).json({ channelName: channelName });
        
    } catch (error) {
        console.log(error);
    }


}

exports.getSubscriptionChannelDetails = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId).populate('subscriptions');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const subscriptions = user.subscriptions;

        res.status(200).json({ subscriptions });
    } catch (error) {
        console.error('Error retrieving subscription details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};