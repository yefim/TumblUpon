/**********************************************************************
 * This file provides utility methods useful for turning each post into
 * Isotope tiles.
 **********************************************************************/

var UTILS = {
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP',
        'OCT', 'NOV', 'DEC']
};

/* Renders a post entry via the following specifications:
 * 
 * content_args = 
 * {
 *      blog_name:
 *      post_url:
 *      type:
 *      photos: [ {original_size: { url: } } ]
 *      body:
 * }
 *
 * The content field contains either an image url if type="photo", or 
 * simple text if type="text".
 */

var MAX_WIDTH = 30;
var PHOTO_INDEX = 0;
var ALT_SIZE_INDEX = 0;

render_entry = function(content_args) {
    // var str = ""; //"<a href='" + content_args.post_url + "'>";
    //var str += "<div class='post " + content_args.type + "'>";
    switch (content_args.type) {
        case "photo":
            var photo = content_args.photos[PHOTO_INDEX];
            return "<div class='post photo' style='background:url("+photo.alt_sizes[ALT_SIZE_INDEX].url+") no-repeat center center'></div>";
        case "text":
            return "<div class='post text'><h1 class='snippet'>" + snip_text(content_args.body) + "</h1></div>";
        default:
            return "<div class='post' style='display:hidden'></div>";
    }
    //str += "\t<h2 class='blog-name'>" + content_args.blog_name + "</h2>\n";
    //str += "\t<h2 class='blog-name'>" + content_args.blog_name + "</h2>\n";
    //str += "\t<p class='datestamp'>" + make_datestamp(content_args.timestamp) + "</p>\n";
    //str += "</div>\n"

    //return str;
}

snip_text = function(string) {
    var result = string.replace(/<(?:.|\n)*?>/gm, '');
    return result.substring(0, MAX_WIDTH) + "...";
}

function make_datestamp (timestamp) {
    var d = new Date(timestamp);
    return UTILS.months[d.getMonth()] + " " + d.getDate();
}
