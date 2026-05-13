// CRON job that publishes posts on time
const cron = require('node-cron');
const Post = require('../models/Post');
const { createMediaContainer, publishMedia } = require('../services/instagramService');

function startScheduler() {
    // "* * * * *" = run every 1 minute
    cron.schedule('* * * * *', async () => {
        console.log('⏰ Scheduler checking for posts...');
        const now = new Date();

        // Find all posts that are SCHEDULED and whose time has passed
        const posts = await Post.find({
            status: 'SCHEDULED',
            scheduleTime: { $lte: now }
        }).populate('accountId'); // Get account details (token, id)

        if (posts.length === 0) { console.log('No posts to publish'); return; }

        for (const post of posts) {
            try {
                if (!post.accountId || !post.accountId.accessToken) {
                    throw new Error('No linked account or access token found for this post');
                }

                console.log(`📤 Publishing post: ${post._id} for account: ${post.accountId.instagramUsername}`);

                // Step 1: Create container
                const containerId = await createMediaContainer(
                    post.mediaUrl, 
                    post.caption, 
                    post.mediaType,
                    post.accountId.accessToken,
                    post.accountId.instagramAccountId
                );

                // Wait 5 seconds for Instagram to process media
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Step 2: Publish
                const instagramPostId = await publishMedia(
                    containerId,
                    post.accountId.accessToken,
                    post.accountId.instagramAccountId
                );
                
                console.log(`✅ Published! Instagram ID: ${instagramPostId}`);

                post.status = 'PUBLISHED';
                post.instagramPostId = instagramPostId;
                await post.save();

            } catch (error) {
                console.error(`❌ Failed: ${post._id}:`, error.message);
                post.status = 'FAILED';
                post.errorMessage = error.message;
                await post.save();
            }
        }
    });
    console.log('✅ Scheduler started — checking every 1 minute');
}

module.exports = { startScheduler };
