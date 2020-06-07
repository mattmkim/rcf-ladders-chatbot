import React, {Component} from 'react'
import {Card, Navbar, Container} from 'react-bootstrap'
import InfiniteScroll from 'react-infinite-scroll-component'
import PostMiddleware from '../Middleware/PostMiddleware'
import Post from '../Components/Post'
import '../public/style/Feed.css'

class Feed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data:[],
            currData:[]
        }
    }

    renderFeed = (currData) => {
        if (currData.length == 0) {
            return <div> No Posts :( </div>
        } else {
            return currData.map((postData) => {
                var uniqueId = postData.date;
                return <Post key={uniqueId} data={postData}/>
            })
        }
    }

    fetchData() {
        var slice = this.state.data.slice(0, 8);
        this.state.data.splice(0, 8);
        var newData = this.state.currData.concat(slice);
        this.setState({
            currData: newData
        });
    }

    async componentDidMount() {
        var response = await PostMiddleware.fetchAllPosts();
        console.log(response);
        this.setState({
            data: response
        });
        var slice = this.state.data.slice(0, 8);
        this.state.data.splice(0, 8);
        this.setState({
            currData: slice
        })
        
    }

    render() {
        return (
            <div>
                <Navbar className="navbar-feed" bg="white">
                    <div class="title-feed">
                        RCFgram
                    </div>
                </Navbar>
                <InfiniteScroll 
                    dataLength={this.state.currData.length} 
                    next={this.fetchData} 
                    hasMore={true}
                    loader={<h4>Loading...</h4>}>
                        {this.renderFeed(this.state.currData)}
                </InfiniteScroll>
            </div>
        )
    }
}

export default Feed;