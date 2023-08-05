import {configureStore} from '@reduxjs/toolkit';
import { allUserReducer, postOfFollowingReducer, userReducer } from './Reduces/User';
import { likeReducer, myPostsReducer } from './Reduces/Post';

const store = configureStore({
    reducer: {
        user: userReducer,
        postOfFollowing: postOfFollowingReducer,
        allUsers: allUserReducer,
        like: likeReducer,
        myPosts: myPostsReducer
    }
})

export default store;