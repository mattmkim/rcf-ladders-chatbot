var routes = function(Post) {

    var fetchAllPosts = function (req, res) {
        Post.find({}).sort({date: 'descending'}).exec(function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
                res.send(response)
            }
        });
    }

    return {
        fetch_all_posts: fetchAllPosts
    }
}

module.exports = routes;