const mongoose = require('mongoose');
require('dotenv').config();

const linkSchema = new mongoose.Schema({
    linkId: String,
    postType: String,
    title: String,
    fileUrl: String,
    createdAt: Date
});

const Link = mongoose.model('Link', linkSchema);

async function listLinks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        const links = await Link.find().sort({ createdAt: -1 }).limit(5);
        console.log("Recent Links:");
        links.forEach(l => {
            console.log(`- ID: ${l.linkId}, Type: ${l.postType}, Title: ${l.title}, URL: ${l.fileUrl}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listLinks();
