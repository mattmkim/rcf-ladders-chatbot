import React, {Component} from 'react'
import {Card, Navbar, Container, Col} from 'react-bootstrap'
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
        console.log("fetching more data")
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
        this.setState({
            data: response
        });
        var slice = this.state.data.slice(0, 8);
        this.state.data.splice(0, 8);
        this.setState({
            currData: slice
        })
        console.log(this.state.currData.length)
    }

    render() {
        if (this.props.isMobileSized) {
            return (
                <div class="mobile">
                    <Navbar className="navbar-feed-mobile" bg="white" fixed="top">
                        <div class="title-feed-mobile">
                            RCFgram
                        </div>
                    </Navbar>
                    <div class="feed-container-mobile">
                        <InfiniteScroll 
                            className="infinite-mobile"
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
                <div class="background">
                    <Navbar className="navbar-feed" bg="white" fixed="top">
                        <div class="title-feed">
                            RCFgram
                        </div>
                    </Navbar>
                    <Container className="feed-info-container">
                        <Col md={{ span: 6.8, offset: 3 }}>
                            <InfiniteScroll 
                                className="infinite"
                                dataLength={this.state.currData.length} 
                                next={this.fetchData.bind(this)} 
                                hasMore={this.state.hasMore}>
                                    {this.renderFeed(this.state.currData)}
                            </InfiniteScroll>                   
                        </Col>
                        <Col xs={6}>
                            <div class="info-card">
                                // TODO: ADD CONTENT
                                <br></br>
                                CONTENT
                                <br></br>
                                CONTENT
                                <br></br>
                                SOME MORE CONTENT

                            </div>
                        </Col>
                        
                    </Container>
                    
                </div>
            )
        }
        
    }
}

export default withWindowDimensions(Feed);