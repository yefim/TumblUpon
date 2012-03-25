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
function render_entry (content_args) {
    var str = ""; //"<a href='" + content_args.post_url + "'>";
    str += "<div class='post " + content_args.type + "'>\n";
    switch (content_args.type) {
        case "photo":
            var photo = content_args.photos[0];
            str += "\t<img src='" + photo.alt_sizes[photo.alt_sizes.length - 3].url + "'/>\n";
            break;
        case "text":
            str += "\t<h1 class='snippet'>" + snip_text(content_args.body) +
                    "</h1>\n";
            break;
    }

    str += "\t<h2 class='blog-name'>" + content_args.blog_name + "</h2>\n";
    str += "\t<p class='datestamp'>" + make_datestamp(content_args.timestamp) + "</p>\n";
    str += "</div>\n"

    return str;
}

function snip_text (string) {
    var MAX_WIDTH = 30;
    var result = string.replace(/<(?:.|\n)*?>/gm, '');
    return result.substring(0, MAX_WIDTH) + "...";
}

function make_datestamp (timestamp) {
    var d = new Date(timestamp);
    return UTILS.months[d.getMonth()] + " " + d.getDate();
}
