var softscroll;
(function (softscroll) {
    softscroll.sscll = function (csstarget, trgtOffset) {
        $('html, body').animate({ scrollTop: (parseInt($(csstarget).offset().top.toString()) + trgtOffset).toString() }, 2000);
    };
})(softscroll || (softscroll = {}));
