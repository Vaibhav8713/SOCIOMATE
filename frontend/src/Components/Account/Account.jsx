import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFollowingPosts, getMyPosts, loadUser, logoutUser } from '../../Actions/User';
import Loader from '../Loader/Loader';
import Post from '../Post/Post';
import { Avatar, Button, Dialog, Typography } from '@mui/material';
import './Account.css';
import { Link, Route } from 'react-router-dom';
import { useAlert } from 'react-alert';
import User from '../User/User';
import Home from '../Home/Home';
import Login from '../Login/Login';

const Account = () => {

    const dispatch = useDispatch();
    const alert = useAlert();

    const { loading, error, posts} = useSelector(state => state.myPosts);
    const { error: likeError, message} = useSelector(state => state.like);
    const { user, loading: userLoading} = useSelector(state => state.user);

    const [followersToggle, setFollowersToggle] = useState(false);
    const [followingToggle, setFollowingToggle] = useState(false);

    const logoutUserHandler = async () => {
        await dispatch(logoutUser());
        dispatch(loadUser());
        alert.success('Logged Out Successfully');
    }

    useEffect(()=>{
        dispatch(getMyPosts());
    }, [dispatch]);

    useEffect(() => {
        if(likeError){
            alert.error(likeError)
            dispatch({ type: 'clearErrors'})
        }
        if(message){
            alert.success(message)
            dispatch({ type: 'clearMessage'})
        }
    }, [alert, error, message]);

  return loading===true || userLoading===true ? <Loader/> : (
    <div className='account'>
        <div className="accountleft">
        {
                posts && posts.length>0 ? (posts.map((post)=>(
                    <Post 
                    key={post._id}
                    postId={post._id}
                    caption={post.caption}
                    postImage={post.image.url}
                    likes={post.likes}
                    comments={post.comments}
                    ownerName={post.owner.name}
                    ownerImage={post.owner.avatar.url}
                    ownerId={post.owner._id}
                    />
                )) ) : 
                (<Typography variant='h6' >  you have not posted anything Yet ! </Typography>)
            }
        </div>
        <div className="accountright">
            <Avatar src={user.avatar.url} sx={{height: '8vmax', width: '8vmax'}} />
            <Typography variant='h5' >  {user.name} </Typography>
            <div>
                <button onClick={() => setFollowersToggle(!followersToggle)}>
                    <Typography> Followers </Typography>
                </button>
                <Typography> {user.followers.length} </Typography>
            </div>

            <div>
                <button onClick={() => setFollowingToggle(!followingToggle)}>
                    <Typography> Following </Typography>
                </button>
                <Typography> {user.following.length} </Typography>
            </div>

            <div>
                <Typography> Posts </Typography>
                <Typography> {user.posts.length} </Typography>
            </div>

            <Button variant='contained' onClick={logoutUserHandler}> Logout</Button>

            <Link to='/update/profile'> Update Profile </Link>
            <Link to='/update/password'> Update Password </Link>

            <Button variant='text' style={{color: 'red', margin:'2vmax'}} > Delete My Profile </Button>

            <Dialog open={followersToggle} onClose={() => setFollowersToggle(!followersToggle)} >
                <div className="DialogBox">
                    <Typography variant='h4' > Followed By :- </Typography>
                    {
                        user && user.followers.length>0 ? (user.followers.map((follower) => (
                            <User key={follower._id} userId={follower._id}  name={follower.name}  avatar={follower.avatar.url} />
                        ) )) : <Typography style={{margin: '2vmax'}}> You have no followers </Typography>
                    }
                </div>
            </Dialog>

            <Dialog open={followingToggle} onClose={() => setFollowingToggle(!followingToggle)} >
                <div className="DialogBox">
                    <Typography variant='h4' > Followings :-  </Typography>
                    {
                        user && user.following.length>0 ? (user.following.map((follow) => (
                            <User key={follow._id} userId={follow._id}  name={follow.name}  avatar={follow.avatar.url} />
                        ) )) : <Typography style={{margin: '2vmax'}} > You are not following anyone ! </Typography>
                    }
                </div>
            </Dialog>
        </div>
    </div>
  )
}

export default Account