import React, { useEffect, useState } from 'react';
import './NewPost.css';
import { Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createNewPost } from '../../Actions/Post';
import { useAlert } from 'react-alert';

const NewPost = () => {

    const [image, setImage] = useState();
    const [caption, setCaption] = useState();

    const {loading, error, message} = useSelector(state => state.like);
    const dispatch = useDispatch();
    const alert = useAlert();

    const handleImageHandler = (e) => {
        const file = e.target.files[0];
        const Reader = new FileReader();
        Reader.readAsDataURL(file);

        Reader.onload = () => {
            if(Reader.readyState==2){
                setImage(Reader.result);
            }
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(createNewPost(caption, image));
    }

    useEffect(()=>{
        if(error){
            alert.error(error);
            dispatch({type: 'clearErrors'})
        }
        if(message){
            alert.success(message);
            dispatch({type: 'clearMessage'})
        }
    },[dispatch, error, alert, message]);

  return (
    <div className='newPost'>
        <div className="newPostForm" onSubmit={submitHandler}>
            <Typography variant='h3'> New Post </Typography>
            {image && <img src={image} alt='post' />}
            <input type='file' accept='image/*' onChange={handleImageHandler} />
            <input type='text' placeholder='Caption....' value={caption} onChange={(e)=>setCaption(e.target.value)} />
            <Button disabled={loading} type='submit' onClick={submitHandler}>Post</Button>
        </div>
    </div>
  )
}

export default NewPost;