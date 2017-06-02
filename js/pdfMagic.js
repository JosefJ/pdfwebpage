/**
 *  Composed by Josef on 5/31/2017 using "pdfjs" example code .
 */
// If absolute URL from the remote server is provided, configure the CORS
    // header on that server.

// link your presentation here
var url = './presentation.pdf';

// The workerSrc property shall be specified.
PDFJS.workerSrc = 'http://mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    pageQuee = [],
    scale = 2,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);


        // Wait for rendering to finish
        renderTask.promise.then(function() {
            console.log("Slide "+pageNum+" loaded!");
            pageRendering = false;
            pageNum = num;

            slideName = "section"+pageNum;
            slideNameJQ = "#"+slideName;

            slideImg = canvas.toDataURL("image/png");
            $(slideNameJQ).children('img').attr('src', slideImg);
            $(slideNameJQ).attr('id', slideName);

            if (pageQuee.length !== 0) {
                // New page rendering is pending
                renderPage(pageQuee.shift());
                pageNumPending = null;
            }
        });
    });

}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */

function queueRenderPage(num) {
    if (pageRendering) {
        pageQuee.push(num);
        //pageNumPending = num;
    } else {
        renderPage(num);
    }
}

PDFJS.getDocument(url).then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;

    var pages = pdfDoc.numPages;
    // Initial/first page rendering
    for (pageNum = 1; pageNum <= pages; pageNum++) {
        slideName = "section"+pageNum;
        slideNameJQ = "#"+slideName;

        $("#fullpage").append("<div id='"+slideName+"' class='section'><img></div>");
        if (pageNum > 1) {
            $(slideNameJQ).addClass("moveDown");
        }
        else {
            $(slideNameJQ).addClass("active");
        }

        queueRenderPage(pageNum);

    }

    /**
     *  by Josef on 5/31/2017.
     */

    $('#fullpage').fullpage({
        'verticalCentered': false,
        'css3': true,
        'sectionsColor': ['#F0F2F4', '#fff', '#fff', '#fff'],
        'navigation': true,
        'navigationPosition': 'right',


        'onLeave': function(index, nextIndex, direction){
            if (index == 3 && direction == 'down'){
                $('.section').eq(index -1).removeClass('moveDown').addClass('moveUp');
            }
            else if(index == 3 && direction == 'up'){
                $('.section').eq(index -1).removeClass('moveUp').addClass('moveDown');
            }

            $('#staticImg').toggleClass('active', (index == 2 && direction == 'down' ) || (index == 4 && direction == 'up'));
            $('#staticImg').toggleClass('moveDown', nextIndex == 4);
            $('#staticImg').toggleClass('moveUp', index == 4 && direction == 'up');
        }
    });

});