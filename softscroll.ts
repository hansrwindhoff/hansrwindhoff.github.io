declare var $;
module softscroll {
  export var sscll = (csstarget: string, trgtOffset: number) => {
    $('html, body').animate({ scrollTop: (parseInt($(csstarget).offset().top.toString()) + trgtOffset).toString() }, 2000)
  }
}