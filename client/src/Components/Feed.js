import React, {Component} from 'react'
import {Card, Navbar, Container} from 'react-bootstrap'
import InfiniteScroll from 'react-infinite-scroll-component'
import withWindowDimensions from './withWindowDimensions.jsx';
import PostMiddleware from '../Middleware/PostMiddleware'
import Post from '../Components/Post'
import '../public/style/Feed.css'

class Feed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data:[],
            currData:[],
            hasMore: true
        }
    }

    renderFeed = (currData) => {
        if (currData.length == 0) {
            return <div class="no-posts">  </div>
        } else {
            return currData.map((postData) => {
                var uniqueId = postData.date;
                return <Post key={uniqueId} data={postData}/>
            })
        }
    }

    fetchData() {
        console.log(this.state)
        if (this.state.data.length == 0) {
            this.setState({
                hasMore: false
            })
        } else {
            var slice = this.state.data.slice(0, 8);
            this.state.data.splice(0, 8);
            var newData = this.state.currData.concat(slice);
            this.setState({
                currData: newData
            });
        }
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
        if (this.props.isMobileSized) {
            return (
                <div>
                    <Navbar className="navbar-feed" bg="white">
                        <div class="title-feed">
                            RCFgram
                        </div>
                    </Navbar>
                    <div class="feed-container">
                        <InfiniteScroll 
                            className="infinite"
                            dataLength={this.state.currData.length} 
                            next={this.fetchData.bind(this)} 
                            hasMore={this.state.hasMore}>
                                {this.renderFeed(this.state.currData)}
                        </InfiniteScroll>                   
                    </div>  
                </div>
            )
        } else {
            return (
                <div>
                    <Navbar className="navbar-feed" bg="white">
                        <div class="title-feed">
                            RCFgram
                        </div>
                    </Navbar>
                    <div class="feed-container">
                        <InfiniteScroll 
                            className="infinite"
                            dataLength={this.state.currData.length} 
                            next={this.fetchData.bind(this)} 
                            hasMore={this.state.hasMore}>
                                {this.renderFeed(this.state.currData)}
                        </InfiniteScroll>                   
                    </div>
                </div>
            )
        }
        
    }
}

export default withWindowDimensions(Feed);