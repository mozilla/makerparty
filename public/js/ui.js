$(".collage-pics").colorbox({
                      rel: "collage-pics"
                   });


// Auto rotates quotes

function rotate(elemClass) {
  var current = $("." + elemClass + ".current");
  current.delay(10000).fadeOut(1000,function(){
    $(this).toggleClass("current");
    var nextQuote = ( $(this).next("."+elemClass).length > 0 ) ?
                          $(this).next("."+elemClass) : $(this).siblings("."+elemClass).eq(0);
    nextQuote.fadeIn(1000).toggleClass("current");
  });
}

function autoRotatingQuotes(elemClass){
  rotate("quote-text");
  rotate("quote-source");
}

setInterval(autoRotatingQuotes, 13000);
