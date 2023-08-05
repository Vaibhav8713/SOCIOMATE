import axios from 'axios';

export const loginUser = (email, password) => async(dispatch) => {
    try {
        dispatch({
            type: 'LoginRequest'
        })

        const {data} = await axios.post("/api/v1/login", {email, password}, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        dispatch({
            type: 'LoginSuccess',
            payload: data.user
        })

    } catch (error) {
        dispatch({
            type: 'LoginFailure',
            payload: error.response.data.message
        })
    }
}

export const loadUser = (email, password) => async(dispatch) => {
    try {
        dispatch({
            type: 'LoadUserRequest'
        })

        const {data} = await axios('/api/v1/me');

        dispatch({
            type: 'LoadUserSuccess',
            payload: data.loggedInUser
        })

    } catch (error) {
        dispatch({
            type: 'LoadUserFailure',
            payload: error.response.data.message
        })
    }
}

export const getFollowingPosts = () => async (dispatch) => {
    try {
        dispatch({
            type: 'postOfFollowingRequest'
        })

        const {data} = await axios.get('/api/v1/posts');

        dispatch({
            type: 'postOfFollowingSuccess',
            payload: data.posts
        })
        
    } catch (error) {
        dispatch({
            type: 'PostOfFollowingFailure',
            payload: error.response.data.message
        })
    }
}

export const getAllUsers = () => async (dispatch) => {
    try {
        dispatch({
            type: 'allUserRequest'
        })

        const {data} = await axios.get('/api/v1/users');

        dispatch({
            type: 'allUserSuccess',
            payload: data.users
        })
        
    } catch (error) {
        dispatch({
            type: 'allUserFailure',
            payload: error.response.data.message
        })
    }
}

export const getMyPosts = () => async (dispatch) => {
    try {
        dispatch({
            type: 'myPostsRequest'
        })

        const {data} = await axios.get('/api/v1/my/posts');

        dispatch({
            type: 'myPostsSuccess',
            payload: data.posts
        })
        
    } catch (error) {
        dispatch({
            type: 'myPostsFailure',
            payload: error.response.data.message
        })
    }
}

export const logoutUser = () => async(dispatch) => {
    try {
        dispatch({
            type: 'LogoutRequest'
        })

        await axios.get("/api/v1/logout")

        dispatch({
            type: 'LogoutSuccess',
        })

    } catch (error) {
        dispatch({
            type: 'LogoutFailure',
            payload: error.response.data.message
        })
    }
}