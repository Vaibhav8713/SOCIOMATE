const postModel = require('../models/Post');
const userModel = require('../models/User');
const cloudinary = require('cloudinary');

exports.createPost = async (req, res) => {
    try {
        
        const myCloud = await cloudinary.uploader.upload(req.body.image, {folder: 'posts'});

        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            },
            owner: req.user._id
        }

        const newPost = await postModel.create(newPostData);

        const user = await userModel.findById(req.user._id);

        user.posts.unshift(newPost._id);

        await user.save(); 

        res.status(201).json({
            success: true,
            message: 'new post created'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.likeAndUnlikePost = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if(!post){
            return res.status(500).json({
                success: false,
                message: "post not found"
            })
        }

        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);
            await post.save();

            return res.status(200).json({
                success: true,
                message: "post unliked"
            })
        }
        else{
            post.likes.push(req.user._id);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "post liked"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deletePost = async(req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "post not found"
            })
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: "unauthorized user, this user is not the owner of this post to be deleted"
            })
        }

        await post.deleteOne();

        const user = await userModel.findById(req.user._id);
        const index = user.posts.indexOf(req.params._id);
        user.posts.splice(index, 1);

        await user.save();

        res.status(200).json({
            success: true, 
            message: "post deleted successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getPostOfFollowing = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id);
        
        const posts = await postModel.find({
            owner: {
                $in: loggedInUser.following
            }
        }).populate('owner likes comments.user')

        res.status(200).json({
            success: true,
            posts: posts.reverse()
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateCaption = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: 'post not found'
            })
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: `unauthorized user, user ${req.user.name} is not the owner of the post to be deleted`
            })
        }

        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success: true,
            message: 'post updated'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.commentOnPost = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: 'post not found'
            })
        }

        // checking if comment already exist, if exist edit the old comment by new comment
        // else add a new coomment

        let commentIndex = -1;
        post.comments.forEach((item, index) => {
            if(item.user.toString() == req.user._id.toString()){
                commentIndex = index;
            }
        })

        // if comment already exist on the post by the current logged in user
        // edit the old comment by new comment
        if(commentIndex != -1){
            post.comments[commentIndex].comment = req.body.comment;
            await post.save();

            return res.status(200).json({
                success: true,
                message: 'old comment updated by new comment'
            })
        }
        else{
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment
            })

            await post.save();
            return res.status(200).json({
                success: true,
                message: 'new comment added'
            })
        } 

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: 'post not found'
            })
        }

        //checking if owner wants to delete the comment 
        if(post.owner.toString() == req.user._id.toString()){
            if(!req.body.commentId){
                return res.status(400).json({
                    success: false,
                    message: 'comment Id is required'
                })
            }

            post.comments.forEach((item, index) => {
                if(item._id.toString() == req.body.commentId.toString()){
                    return post.comments.splice(index, 1);
                }
            })

            await post.save();

            return res.status(200).json({
                success: false,
                message: 'selected comment has deleted'
            })
        }
        else{
            post.comments.forEach((item, index) => {
                if(item.user.toString() == req.user._id.toString()){
                    return post.comments.splice(index, 1);
                }
            })

            await post.save();

            return res.status(200).json({
                success: false,
                message: 'your comment has deleted'
            })
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}