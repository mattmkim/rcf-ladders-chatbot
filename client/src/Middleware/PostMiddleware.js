import axios from 'axios'

class Post {
    async fetchAllPosts () {
        const res = await axios.post('/api/fetchposts')
        console.log(res);
        return res.data;
    }
}

export default new Post();