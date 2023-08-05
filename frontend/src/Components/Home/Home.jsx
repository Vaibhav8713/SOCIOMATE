import React, { useEffect } from 'react'
import './Home.css';
import User from '../User/User';
import Post from '../Post/Post'
import { useDispatch, useSelector } from 'react-redux';
import { getFollowingPosts, getAllUsers} from '../../Actions/User';
import Loader from '../Loader/Loader';
import { Typography } from '@mui/material';
import { useAlert } from 'react-alert';


const Home = () => {

    const dispatch = useDispatch();

    const {loading, posts, error} = useSelector(state => state.postOfFollowing);

    const {users, loading: userLoading} = useSelector(state => state.allUsers)
    
    useEffect(()=>{
        dispatch(getFollowingPosts());
        dispatch(getAllUsers());
    }, [dispatch])

    const alert = useAlert();
    const {error: likeError, message} = useSelector(state => state.like);

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

  return loading==true || userLoading==true ? <Loader/> : (
    <div className='home'>
        <div className="homeleft">
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
                (<Typography variant='h6' > No posts yet </Typography>)
            }
        </div>

        <div className="homeright">
            {users && users.length>0 ? (
                users.map((user) => (
                    <User key={user._id} userId={user._id} name={user.name} avatar={user.avatar.url} />
                ))
                ) : (
                    <Typography> No user found </Typography>
                )
            }
        </div>
    </div>
  )
}

export default Home