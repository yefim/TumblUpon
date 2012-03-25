/**********************************************************************
 * This file provides utility methods useful for turning each post into
 * Isotope tiles.
 **********************************************************************/

/* Renders a post entry via the following specifications:
 * 
 * content_args = 
 * {
 *      blog_name:
 *      post_url:
 *      type:
 *      content:
 * }
 *
 * The content field contains either an image url if type="photo", or 
 * simple text if type="text".
 */
function render_entry (content_args) {
    var str = "<a href=\"" + content_args.post_url + "\">";
    str += "<div class=\"item " + content_args.type + "\">\n";
    switch (content_args.type) {
        case "photo":
            str += "\t<img src=\"" + content_args.content + "\"/>\n";
            break;
        case "text":
            str += "\t<h1 class=\"snippet\">" + snip_text(content_args.content) +
                    "</h1>\n";
            break;
    }

    str += "\t<h2 class=\"blog-name\">" + content_args.blog_name + "</h2>\n";
    str += "</div></a>\n"

    return str;
}

function snip_text (string) {
    var MAX_WIDTH = 30;

    return string.substring(0, MAX_WIDTH) + "...";
}
