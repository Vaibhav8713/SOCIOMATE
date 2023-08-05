const userModel = require('../models/User');
const postModel = require('../models/Post');
const { sendEmail } = require('../middlewares/sendEmail');

exports.register = async(req, res) => {
    try {
        const {name, email, password} = req.body;
        let user = await userModel.findOne({email});
        if(user){
            return res.status(400).json({
                success: false,
                message: "user already registered"
            })
        }

        user = await userModel.create({
            name,
            email,
            password,
            avatar: { public_id: "sample_id", url: "sample_url"}
        })

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90*24*60*60*1000),
            httpOnly: true
        }

        res.status(200).cookie('token', token, options).json({
            success: true,
            message: "registered successfully",
            user, token
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        
        const user = await userModel.findOne({email}).select('+password').populate('posts followers following');
        if(!user){
            return res.status(400).json({
                success: false, 
                message: "user does not exist"
            })
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "incorrect password"
            })
        }

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90*24*60*60*1000),
            httpOnly: true
        }

        res.status(200).cookie('token', token, options).json({
            success: true,
            user, token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.followUser = async(req, res) => {
    try {
        const userToFollow = await userModel.findById(req.params.id);
        const loggedInUser = await userModel.findById(req.user._id);

        if(!userToFollow){
            return res.status().json({
                success: false,
                message: "the user you are trying to follow does not exist"
            })
        }

        if(loggedInUser.following.includes(userToFollow._id)){
            const followingIndex = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(followerIndex, 1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: `${loggedInUser.name} just Unfollowed ${userToFollow.name}`
            })
        }
        else{
            userToFollow.followers.push(loggedInUser._id);
            loggedInUser.following.push(userToFollow._id);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: `${loggedInUser.name} just started following ${userToFollow.name}`
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.loggedInUserName = async(req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id);
        if(!loggedInUser){
            return res.status(400).json({
                success: false,
                message: 'current logged in user name cannot be displayed'
            })
        }

        res.status(200).json({
            success: true,
            message: `current logged in user name =  ${loggedInUser.name}`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.logout = async(req, res) => {
    try {
        res.status(200).cookie('token', null, {expires: new Date(Date.now()), httpOnly: true})
        .json({
            success: true,
            message: `${req.user.name} just logged out successfully`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id).select('+password');
        const {oldPassword, newPassword} = req.body;
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false, 
                message: 'please provide old and new password'
            })
        }
        const isMatch = await loggedInUser.matchPassword(oldPassword);
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: 'incorrect old password'
            })
        }

        loggedInUser.password = newPassword;
        await loggedInUser.save();

        res.status(200).json({
            success: true,
            message: 'password updated'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id);
        const {name, email} = req.body;
        
        if(name){
            loggedInUser.name = name;
        }
        if(email){
            loggedInUser.email = email
        }

        //avatar todo

        await loggedInUser.save();

        res.status(200).json({
            success: false,
            message: 'profile updated'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.myProfile = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id).populate('posts followers following');

        res.status(200).json({
            success: true,
            loggedInUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteMyProfile = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id);
        const posts = loggedInUser.posts;
        const followers = loggedInUser.followers;
        const following = loggedInUser.following;
        const userId = req.user._id;

        //deleting user profile
        await loggedInUser.deleteOne(); 

        // Loging Out user after deletion of user profile, otherwise it will give us error 
        res.cookie('token', null, {expires: new Date(Date.now()), httpOnly: true});

        //deleting all posts of the user
        for(let i=0; i<posts.length; i++){
            const post = await postModel.findById(posts[i]);
            await post.deleteOne();
        }

        // removing user from followers followings list
        for(let i=0; i<followers.length; i++){
            const follower = await userModel.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();
        }

        // removing user from following's follower
        for(let i=0; i<following.length; i++){
            const follows = await userModel.findById(following[i]);
            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.save();
        }

        res.status(200).json({
            success: true,
            message: 'user profile deleted'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).populate('posts followers following');
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({});
        return res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.forgotPassword = async(req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email});
        if(!user){
            return res.status(404).json({
                success: false, 
                message: 'user not found'
            })
        }

        const resetPasswordToken = user.getResetPasswordToken();
        await user.save(); // to save to all the changes made in the user

        // everytime this resetUrl will be different bcz resetPasswordToken would be diff everytime.
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetPasswordToken}`;
        const message = `Reset your password by clicking on the link below :\n${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Reset password",
                message
            })

            res.status(200).json({
                success: true,
                message: `email sent to ${user.email}`
            })
        } catch (error) {
            user.resetPasswordToken = undefined,
            user.resetPasswordExpire = undefined,
            await user.save();

            res.status(500).json({
                success: false,
                message: error.message
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMyPosts = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);

        const posts=[];

        for(let i=0; i<user.posts.length; i++){
            const post = await postModel.findById(user.posts[i]).populate('likes comments.user owner');
            posts.push(post);
        }

        return res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}