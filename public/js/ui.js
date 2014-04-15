$(".collage-pics").colorbox({
                      rel: "collage-pics"
                   });


// Randomly pick a quote to start

showQuote();

function showQuote() {
  var totalNum = $(".quote-text").length;
  var indexShown = Math.floor( Math.random()*totalNum );
  $(".quote-text").eq(indexShown).addClass("current");
  $(".quote-source").eq(indexShown).addClass("current");
  setInterval(autoRotatingQuotes, 13000);
}

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

function autoRotatingQuotes(){
  rotate("quote-text");
  rotate("quote-source");
}
