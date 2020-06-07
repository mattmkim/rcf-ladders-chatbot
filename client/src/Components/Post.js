import React, {Component} from 'react'
import {Card, Image} from 'react-bootstrap'
import withWindowDimensions from './withWindowDimensions.jsx';
import '../public/style/Post.css'

class Post extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: this.props.data.date,
            firstName: this.props.data.firstName,
            lastName: this.props.data.lastName,
            profileUrl: this.props.data.profileUrl,
            imageUrl: this.props.data.imageUrl,
            caption: this.props.data.caption,
        }
    }

    render() {
        
        if (this.props.isMobileSized) {
            var date = new Date(this.state.date);
            return (
                <div class="post-mobile">
                    <div class="header-mobile">
                        <div class="profile-image-wrapper">
                            <Image className="profile-image" src={this.state.profileUrl}></Image> 
                        </div>  
                        <div class="name">
                            <b>{this.state.firstName} {this.state.lastName}</b>
                        </div>
                    </div>  
                    <div class="post-image-wrapper-mobile">
                        <Image className="post-image" src={this.state.imageUrl} ></Image>
                    </div>
                    <div class="post-caption-mobile">
                        <b>{this.state.firstName} {this.state.lastName}</b> {this.state.caption}
                    </div>    
                    <div class="post-date">
                        {date.toString().substring(0, 15).toUpperCase()}
                    </div>
                </div>
            )
        } else {
            var date = new Date(this.state.date);
            return (
                <div>
                    <Card className="post-card">
                        <Card.Body className="card-body">
                            <div class="header">
                                <div class="profile-image-wrapper" style={{backgroundImage: "url(" + this.state.profileUrl + ")"}}>
                                </div>  
                                <div class="name">
                                    <b>{this.state.firstName} {this.state.lastName}</b>
                                </div>
                            </div>  
                            <div class="post-image-wrapper">
                                <Image className="post-image" src={this.state.imageUrl} ></Image>
                            </div>
                            <div class="post-caption">
                                <b>{this.state.firstName} {this.state.lastName}</b> {this.state.caption}
                            </div>
                            <div class="post-date">
                                {date.toString().substring(0, 15).toUpperCase()}
                            </div>
                        </Card.Body>
                        
                    </Card>
                </div>
            )
        }
        
    }

}

export default withWindowDimensions(Post);