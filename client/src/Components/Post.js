import React, {Component} from 'react'

class Post extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: this.props.data.date,
            firstName: this.props.data.firstName,
            lastName: this.props.data.lastName,
            profileUrl: this.props.data.profileUrl,
            imageUrl: this.props.data.imageUrl,
            caption: this.props.data.caption
        }
      }

    render() {
        return (
            <div>
                {this.state.firstName}
            </div>
        )
    }

}

export default Post;